import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// enable cors
app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.get("/", async (c) => {
  console.log("Hello Hono!");

  console.log("c env", c.env);

  const envData = c.env.DB;
  console.log("env", envData);

  const result = await c.env.DB.prepare("SELECT * FROM stats").bind().all();

  return c.json(result);
});

app.post(
  "/add-stat",
  zValidator(
    "json",
    z.object({
      app: z.string(),
      framework: z.string(),
    })
  ),
  async (c) => {
    try {
      console.log("req body", c.req.valid("json"));
      const { app, framework } = c.req.valid("json");

      let stat = await c.env.DB.prepare("SELECT * FROM stats WHERE app = ?")
        .bind(app)
        .first();

      console.log("getStatForApp", stat);

      // if stats not found for framework then we create a new record
      if (!stat) {
        const createdRecord = await c.env.DB.prepare(
          "INSERT INTO stats (app, totalProjectGenerated) VALUES (?, ?)"
        )
          .bind(app, 1)
          .run();

        if (!createdRecord.results[0]) {
          throw new Error("Failed to create stat");
        }

        stat = createdRecord.results[0];

        // add project generated stats record
        await c.env.DB.prepare(
          "INSERT INTO projectGeneratedStats (statId, framework, genCount) VALUES (?, ?, ?)"
        )
          .bind(stat.id, framework, 1)
          .run();
      } else {
        const projectGeneratedStat = await c.env.DB.prepare(
          "SELECT * FROM projectGeneratedStats WHERE statId = ?"
        )
          .bind(stat.id)
          .first();

        const totalGeneratedForFramework = Number(
          projectGeneratedStat?.genCount || 0
        );

        if (!projectGeneratedStat) {
          await c.env.DB.prepare(
            "INSERT INTO projectGeneratedStats (statId, framework, genCount) VALUES (?, ?, ?)"
          )
            .bind(stat.id, framework, 1)
            .run();
        } else {
          await c.env.DB.prepare(
            "UPDATE projectGeneratedStats SET genCount = ? WHERE statId = ?"
          )
            .bind(totalGeneratedForFramework + 1, stat.id)
            .run();
        }
      }

      return c.json({
        success: true,
        data: stat,
        message: "Success",
      });
    } catch (error: any) {
      console.error("Error adding stat", error);
      return c.json(
        {
          success: false,
          data: null,
          message: error?.message ?? "Error adding stat",
        },
        500
      );
    }
  }
);

app.get("/all-stats", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `
      SELECT 
        s.id as statId,
        s.app,
        s.totalProjectGenerated,
        s.createdAt,
        s.updatedAt,
        pgs.framework,
        pgs.genCount
      FROM stats s
      LEFT JOIN projectGeneratedStats pgs ON s.id = pgs.statId
      ORDER BY s.id ASC
    `
    )
      .bind()
      .all();

    // Group results by stat
    const groupedStats = result.results.reduce((acc: any, row: any) => {
      if (!acc[row.statId]) {
        acc[row.statId] = {
          id: row.statId,
          app: row.app,
          totalProjectGenerated: row.totalProjectGenerated,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          frameworks: [],
        };
      }
      if (row.framework) {
        acc[row.statId].frameworks.push({
          framework: row.framework,
          genCount: row.genCount,
        });
      }
      return acc;
    }, {});

    return c.json({
      success: true,
      data: Object.values(groupedStats),
      message: "Success",
    });
  } catch (error) {
    console.error("Error fetching all stats", error);
    return c.json(
      {
        success: false,
        data: null,
        message: "Error fetching all stats",
      },
      500
    );
  }
});

export default app;

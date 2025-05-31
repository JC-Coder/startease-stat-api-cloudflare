import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getPrisma } from "./prismaFunction";
import { Bindings } from "hono/types";

export interface Env {
  DB: D1Database;
}

const app = new Hono<{
  Bindings: Env;
}>();

// enable cors
app.use(
  "*",
  cors({
    origin: "*",
  })
);

app.get("/", async (c) => {
  console.log("Hello Hono!");
  const prisma = getPrisma(c.env.DB);

  const stats = await prisma.stat.findFirst({});

  return c.json(stats);
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

      const prisma = getPrisma(c.env.DB);

      const stat = await prisma.stat.findFirst({
        where: {
          app: app,
        },
        include: {
          projectGeneratedStats: true,
        },
      });

      if (!stat) {
        await prisma.stat.create({
          data: {
            app: "startease",
            totalProjectsGenerated: 1,
            projectGeneratedStats: {
              create: {
                framework,
                genCount: 1,
              },
            },
          },
        });
      } else {
        const frameworkExist = stat?.projectGeneratedStats?.find(
          (stat) => stat.framework.toLowerCase() === framework.toLowerCase()
        );

        if (frameworkExist) {
          await prisma.stat.update({
            where: {
              id: stat.id,
            },
            data: {
              totalProjectsGenerated: {
                increment: 1,
              },
              projectGeneratedStats: {
                update: {
                  where: {
                    id: frameworkExist.id,
                  },
                  data: {
                    genCount: {
                      increment: 1,
                    },
                  },
                },
              },
            },
          });
        } else {
          await prisma.stat.update({
            where: {
              id: stat.id,
            },
            data: {
              totalProjectsGenerated: {
                increment: 1,
              },
              projectGeneratedStats: {
                create: {
                  framework,
                  genCount: 1,
                },
              },
            },
          });
        }
      }

      return c.json({
        success: true,
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

app.get(
  "/all-stats",
  zValidator(
    "query",
    z.object({
      app: z.string().optional(),
    })
  ),
  async (c) => {
    try {
      const { app } = c.req.valid("query");

      console.log("app", app);

      const prisma = getPrisma(c.env.DB);
      const stats = app
        ? await prisma.stat.findFirst({
            where: { app: app },
            include: {
              projectGeneratedStats: true,
            },
          })
        : await prisma.stat.findMany({
            include: {
              projectGeneratedStats: true,
            },
          });

      return c.json({
        success: true,
        data: stats,
        message: "Success",
      });
    } catch (error) {
      console.error("error getting stats", error);
      return c.json({
        success: false,
        data: null,
        message: "Error getting stats",
      });
    }
  }
);

export default app;

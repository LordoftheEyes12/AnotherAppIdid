import { DB } from 'https://deno.land/x/sqlite/mod.ts';
import { route, type Route } from "jsr:@std/http/unstable-route";

const db = new DB('test.db');

const routes: Route[] = [
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {

        checkDB();
        const html = await Deno.readFile("./public/index.html");

        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET", "HEAD"],
    pattern: new URLPattern({ pathname: "/readArticle" }),
    handler: async (req: Request) => {
      if (req.method === "HEAD") {
        return new Response(null);
      }
      if (req.method === "GET") {

        const articles = db.query("SELECT title, content FROM articles");

        return new Response(JSON.stringify(articles), { headers: { "Content-Type": "application/json" } });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET"],
    pattern: new URLPattern({ pathname: "/findArticle" }),
    handler:(req: Request) => {
      if (req.method === "GET") {
        const url = new URL(req.url);
        const title = url.searchParams.get("title");

        if (!title) {
          return new Response("Title query parameter is required", { status: 400 });
        }

        const articles = db.query("SELECT title, content FROM articles WHERE title = ?", [title]);

        return new Response(JSON.stringify(articles), { headers: { "Content-Type": "application/json" } });
      }

      return new Response("Method not allowed", { status: 405 });
    }
  },
  {
    method: ["POST"],
    pattern: new URLPattern({ pathname: "/addArticle" }),
    handler: async (req: Request) => {
      if (req.method === "POST") {
        const body = await req.json();
        const { title, content } = body;

        db.query("INSERT INTO articles (title, content) VALUES (?, ?)", [title, content]);
        return new Response(JSON.stringify({ message: "Article added", article: { title, content } }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET"],
    pattern: new URLPattern({ pathname: "/script.js" }),
    handler: async (req: Request) => {
      if (req.method === "GET") {
        const script = await Deno.readFile("./public/script.js");
        return new Response(script, { headers: { "Content-Type": "application/javascript" } });
      }
  
      return new Response("Method not allowed", { status: 405 });
    },
  },
  {
    method: ["GET"],
    pattern: new URLPattern({ pathname: "/style.css" }),
    handler: async (req: Request) => {
      if (req.method === "GET") {
        const styles = await Deno.readFile("./public/style.css");
        return new Response(styles, { headers: { "Content-Type": "text/css" } });
      }
  
      return new Response("Method not allowed", { status: 405 });
    },
  }
 
  
];

function checkDB() {
  db.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
}

function defaultHandler(_req: Request) {
  return new Response("Not found", { status: 404 });
}


Deno.serve({ port: 3742 }, route(routes, defaultHandler));
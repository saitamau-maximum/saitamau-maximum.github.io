import { z } from "zod";
import { readdirSync, readFileSync, lstatSync } from "fs";
import { join, resolve } from "path";

const schema = z.object({
  title: z
    .string({ required_error: "titleは必須です" })
    .min(1, { message: "titleは必須です" })
    .regex(/^".+"$/, {
      message: 'titleは"(ダブルクォーテーション)で囲ってください',
    }),
  date: z
    .string({ required_error: "dateは必須です" })
    .regex(/^".+"$/, {
      message: 'dateは"(ダブルクォーテーション)で囲ってください',
    })
    .regex(/^"\d{4}-\d{2}-\d{2}"$/, {
      message: 'dateは"YYYY-MM-DD"の形式で入力してください',
    }),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "空のタグは許可されていません" })
        .regex(/^".+"$/, {
          message: 'タグの各要素は"(ダブルクォーテーション)で囲ってください',
        }),
      { required_error: "tagsは必須です" }
    )
    .length(1, { message: "1つ以上入力してください" }),
  author: z
    .string({ required_error: "authorは必須です" })
    .min(1, { message: "authorは必須です" })
    .regex(/^".+"$/, {
      message: 'authorは"(ダブルクォーテーション)で囲ってください',
    }),
});

const example = `
---
title: "タイトル"
date: "2021-01-01"
tags: ["タグ1", "タグ2"]
author: "maximum-account"
---
`.trim();

const red = "\x1b[31m";
const green = "\x1b[32m";
const blue = "\x1b[34m";
const reset = "\x1b[0m";

const ROOT = resolve(__dirname, "..");

type Error = {
  file: string;
  error: string;
};

const errors: Error[] = [];

const re = /---\s*([\s\S]*?)\s*---/;

const findMarkdownFilesInDeep = (ignore: string, dir: string): string[] => {
  const files = readdirSync(dir);
  return files.reduce((acc: string[], file) => {
    const filePath = join(dir, file);
    if (filePath.match(ignore)) {
      return acc;
    }
    if (lstatSync(filePath).isDirectory()) {
      return [...acc, ...findMarkdownFilesInDeep(ignore, filePath)];
    }
    if (filePath.endsWith(".md")) {
      return [...acc, filePath];
    }
    return acc;
  }, []);
};

const parseFrontmatter = (fp: string, frontmatter: string): Error[] => {
  const matter: Record<string, string | string[]> = {};
  frontmatter.split("\n").forEach((line) => {
    const [key, value] = line.split(":");
    if (key === "tags") {
      const tags = value
        .replace(/\[|\]/g, "")
        .split(",")
        .filter((tag) => tag.trim() !== "");
      matter[key.trim()] = tags.map((tag) => tag.trim());
      return;
    }
    if (key && value) {
      matter[key.trim()] = value.trim();
    }
  });
  const parsedMatter = schema.safeParse(matter);
  if (!parsedMatter.success) {
    return parsedMatter.error.issues.map((issue) => ({
      file: fp.replace(ROOT, "."),
      error: issue.message,
    }));
  }
  return [];
};

const getFrontmatter = (fp: string): [string, Error | null] => {
  const content = readFileSync(fp, "utf-8");
  const [, frontmatter] = content.match(re) || [];
  if (!frontmatter) {
    return [
      "",
      {
        file: fp.replace(ROOT, "."),
        error: "frontmatterが見つかりませんでした",
      },
    ];
  }
  return [frontmatter, null];
};

const args = process.argv.slice(2);

if (args[0] !== "--ignore") {
  console.error("❌ 不正な引数です");
  console.error("使い方: ts-node ./scripts/frontmatter.ts --ignore [glob]");
  process.exit(1);
}

const ignore = args[1];

if (!ignore) {
  console.error("❌ --ignoreに続く引数がありません");
  console.error("使い方: ts-node ./scripts/frontmatter.ts --ignore [glob]");
  process.exit(1);
}

const markdownFiles = findMarkdownFilesInDeep(ignore, ROOT);

markdownFiles.forEach((file) => {
  const [frontmatter, error] = getFrontmatter(file);
  if (error) {
    errors.push(error);
    return;
  }
  const frontmatterErrors = parseFrontmatter(file, frontmatter);
  errors.push(...frontmatterErrors);
});

if (errors.length > 0) {
  console.error(`${red}frontmatterの検証に失敗しました${reset}`);
  errors.forEach(({ file, error }) => {
    console.error(`${file}: ${error}`);
  });
  console.error("");
  console.error(`${blue}frontmatterの例${reset}`);
  console.error(example);
  process.exit(1);
}

console.log(`${green}frontmatterの検証に成功しました${reset}`);

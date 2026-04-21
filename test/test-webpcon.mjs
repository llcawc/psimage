import webpcon from "../src/webpcon.js";
import fs from "fs";

async function test() {
  try {
    // Читаем тестовое изображение из папки images
    const buffer = fs.readFileSync("./images/burg.jpg");
    const plugin = webpcon({ quality: 75 });
    const result = await plugin(buffer);
    console.log("WEBP conversion successful, output size:", buffer.length, " > ", result.length);

    // Сохраним результат для проверки
    fs.writeFileSync("./test/test-output.webp", result);
    console.log("Saved to test-output.webp");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();

import avifcon from "../src/avifcon.js";
import fs from "fs";

async function test() {
  try {
    // Читаем тестовое изображение из папки images
    const buffer = fs.readFileSync("./images/burg.jpg");
    const plugin = avifcon({ quality: 75 });
    const result = await plugin(buffer);
    console.log("AVIF conversion successful, output size:", buffer.length, " > ", result.length);

    // Сохраним результат для проверки
    fs.writeFileSync("./test/test-output.avif", result);
    console.log("Saved to test-output.avif");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();

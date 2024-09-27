import { test, expect } from "vitest";
import { countWords } from "../src";

test("text separated with whitespace", () => {
  expect(countWords("hello world I am here")).toBe(5);
});

test("text separated by punctuation & no whitespace", () => {
  expect(
    countWords(
      "hello,world,I,am,here.What,are you doing?I*don't,care.This.is.a.new world."
    )
  ).toBe(17);
});

test("text separated by punctuation & whitespace", () => {
  expect(
    countWords(
      "hello world, I am here. What are you doing? I don't care. This is a new world."
    )
  ).toBe(17);
});

test("text separated by new lines", () => {
  expect(countWords("hello\nworld\nmy name is")).toBe(5);
});

test("text separated by tabs", () => {
  expect(countWords("hello\tworld\tmy\tname\tis\tworld")).toBe(6);
});

test("text separated by extra whitespace", () => {
  expect(countWords("hello         world            i am")).toBe(4);
});

test("text separated by punctuation & whitespace together", () => {
  expect(countWords("hello: world")).toBe(2);
});

test("text separated leading & trailing whitespace", () => {
  expect(countWords("               hello world           ")).toBe(2);
});

test("chinese text", () => {
  expect(countWords("始计")).toBe(2);
});

test("chinese text with punctuation & whitespace", () => {
  expect(countWords("夫未战而庙算胜者，得算多也")).toBe(12);
});

const languages = {
  khmer: [`អ្នក​សុខសប្បាយ​ទេ`, 15],
  thai: [`สบายดีไหม`, 9],
  lao: [`ສະ​ບາຍ​ດີ​ບໍ?`, 9],
  chinese1 : [`你好吗? ✨😊`, 3], // new test case added chinese characters with emoji 
  chinese2 : [`你好吗?!~`, 3], // new test case added chinese characters with symbols
};
for (let lang in languages) {
  test(`${lang} text`, () => {
    const [text, expected] = languages[lang];
    expect(countWords(text)).toBe(expected);
  });
}

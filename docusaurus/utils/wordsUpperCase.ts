const wordsUpperCase = (text: string): string =>
  text
    .split(/\W+/gm)
    .map((word) =>
      word.length < 3 ? word : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");

export default wordsUpperCase;

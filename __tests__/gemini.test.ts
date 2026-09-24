import {parseModelJson} from '../src/api/gemini';

test('strips markdown fences from Gemini JSON', () => {
  const raw = `\`\`\`json
{"matchPercent":80,"summary":"Solid junior match","matchingSkills":["TypeScript"],"missingSkills":["Redux"],"experienceAlignment":"Internships align with mobile work","suggestedEdits":["Add RN projects","Quantify impact","Mention TypeScript"]}
\`\`\``;

  const result = parseModelJson(raw);
  expect(result.matchPercent).toBe(80);
  expect(result.matchingSkills).toEqual(['TypeScript']);
  expect(result.suggestedEdits).toHaveLength(3);
});

test('clamps matchPercent into 0-100', () => {
  const result = parseModelJson(
    '{"matchPercent":140,"summary":"","matchingSkills":[],"missingSkills":[],"experienceAlignment":"","suggestedEdits":[]}',
  );
  expect(result.matchPercent).toBe(100);
});

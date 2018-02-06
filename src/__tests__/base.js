import cases from "jest-in-case";
import {
  getAllImports,
  replaceImport,
  parseDeps,
  parseFile,
  getCSBData
} from "../index";

const codeImportTests = [
  { name: "simple import", code: `import a from 'b'` },
  { name: "spread import", code: `import { a } from 'b'` },
  { name: "two imports", code: `import a from 'b' import c from 'd'` },
  {
    name: "multiline imports",
    code: `import a from 'b'
import c from 'd'`
  },
  { name: "two spread imports", code: `import { a, b } from 'c'` },
  {
    name: "two spread imports multiline",
    code: `import {
  a,
  b
} from 'c'`
  },
  { name: "no spaces", code: `import {a} from 'b'` },
  {
    name: "dev and peer deps",
    code: `import {a} from 't' import s from 'z' import y from 'x'`
  },
  {
    name: "relativeImport",
    code: `import {a} from './c'`
  }
];

cases(
  "getAllImports()",
  ({ code }) => {
    let mpts = getAllImports(code);
    expect(mpts).toMatchSnapshot();
  },
  codeImportTests
);

cases(
  "replaceImport()",
  ({ code }) => {
    let newCode = replaceImport(code, "b", "zzz");
    expect(newCode).toMatchSnapshot();
  },
  codeImportTests
);

const fakePKGJSON = {
  name: "not-a-real-name",
  version: "0.0.1",
  devDependencies: { b: "v1.0.0" },
  peerDependencies: { z: "v1.0.0", x: "v0.3.0" },
  dependencies: { x: "v1.0.0" }
};

cases(
  "parseDeps()",
  ({ code }) => {
    let imports = getAllImports(code);
    let parsedImports = parseDeps(fakePKGJSON, imports);
    // console.log(imports);
    // console.log(parsedImports);
    expect(parsedImports).toMatchSnapshot();
  },
  codeImportTests
);

cases(
  "ParseFile()",
  async ({ file, pkgJSON }) => {
    let parsedFile = await parseFile(file, pkgJSON);
    expect(parsedFile).toMatchSnapshot();
  },
  [
    {
      name: "simple parse",
      file: `import a from 'b'; import c from './c'`,
      pkgJSON: fakePKGJSON
    },
    {
      name: "simple parse file promise",
      file: Promise.resolve(`import a from 'b'; import c from './c'`),
      pkgJSON: fakePKGJSON
    },
    {
      name: "simple parse pkgJSON promise",
      file: `import a from 'b'; import c from './c'`,
      pkgJSON: Promise.resolve(fakePKGJSON)
    }
  ]
);

cases(
  "getCSBData()",
  async ({ file, pkgJSON, config }) => {
    let csbData = await getCSBData(file, pkgJSON, config);
    expect(csbData).toMatchSnapshot();
  },
  [
    {
      name: "simple parse",
      file: `import a from 'b'; import c from './c'`,
      pkgJSON: fakePKGJSON,
      config: {}
    },
    {
      name: "adding new dependency",
      file: `import a from 'b'; import c from './c'`,
      pkgJSON: fakePKGJSON,
      config: { startingDeps: { d: "1.1.0" } }
    },
    {
      name: "adding extra file",
      file: `import a from 'b'; import c from './lib/c'`,
      pkgJSON: fakePKGJSON,
      config: {
        providedFiles: { "lib/c": { content: "export default 'something'" } }
      }
    }
  ]
);

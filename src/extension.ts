// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import errorList from "./errorList";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate() {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "helloworld-sample" is now active!'
  );
  let hoverDisposable: vscode.Disposable | undefined;
  const updateUnderlines = async () => {
    if (hoverDisposable) {
      hoverDisposable.dispose();
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor?.document) {
      return;
    }
    const doc = editor.document;
    const UnderlineDecoration = vscode.window.createTextEditorDecorationType({
      textDecoration:
        "underline wavy var(--vscode-errorForeground) 1.17px; text-underline-offset: 2px",
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
    const docText = doc.getText();
    const words = /\w+/gm;
    let match = words.exec(docText);
    const ranges: vscode.Range[] = [];
    const errors: { message: string; dino: string }[] = [];
    while (match !== null) {
      const matchedText = match[0];
      const matchIdx = match.index;
      const range = new vscode.Range(
        doc.positionAt(matchIdx),
        doc.positionAt(matchIdx + matchedText.length)
      );
      ranges.push(range);

      match = words.exec(docText);
    }

    for (let i = 0; i < ranges.length; i++) {
      errors.push({
        message: errorList[Math.floor(Math.random() * errorList.length)],
        dino: `https://geta.dino.icu/dino.png?key=${Math.random()}`,
      });
    }
    editor.setDecorations(UnderlineDecoration, ranges);
    hoverDisposable = vscode.languages.registerHoverProvider(
      { pattern: "**" },
      {
        provideHover: (document, position, token) => {
          if (document !== doc) {
            return;
          }
          const foundIdx = ranges.findIndex((range) => {
            return range.contains(position);
          });
          if (foundIdx === -1) {
            return;
          }
          const markdownString = new vscode.MarkdownString(
            `${errors[foundIdx].message}
          
<img width="250" src="${errors[foundIdx].dino}" />`
          );
          markdownString.supportHtml = true;
          return new vscode.Hover(markdownString);
        },
      }
    );
  };
  vscode.window.onDidChangeActiveTextEditor(updateUnderlines);
  vscode.workspace.onDidChangeTextDocument(async (e) => {
    if (e.document === vscode.window.activeTextEditor?.document) {
      await updateUnderlines();
    }
  });
  await updateUnderlines();
}

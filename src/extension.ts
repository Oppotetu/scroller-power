import * as vscode from "vscode";

type Direction = "up" | "down";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("scrollerPower");

  const linesToScrollHalfPage: number =
    config.get("linesToScrollHalfPage") || 25;
  const linesToScrollFullPage: number =
    config.get("linesToScrollFullPage") || 50;

  const totalDelay: number = config.get("totalDelay") || 30;
  const linesPerTick: number = config.get("linesPerTick") || 3;

  const scroll = async (direction: Direction, totalLines: number) => {
    const delayPerTick = Math.max(3, totalDelay / (totalLines / linesPerTick));

    for (let scrolled = 0; scrolled < totalLines; scrolled += linesPerTick) {
      await vscode.commands.executeCommand("editorScroll", {
        to: direction,
        by: "line",
        value: linesPerTick,
        revealCursor: true,
      });

      await vscode.commands.executeCommand("cursorMove", {
        to: direction,
        by: "line",
        value: linesPerTick,
      });

      await delay(delayPerTick);
    }
  };

  const scrollHalfDown = vscode.commands.registerCommand(
    "scrollerPower.halfPageDown",
    () => {
      scroll("down", linesToScrollHalfPage);
    }
  );

  const scrollHalfUp = vscode.commands.registerCommand(
    "scrollerPower.halfPageUp",
    () => {
      scroll("up", linesToScrollHalfPage);
    }
  );

  const scrollDown = vscode.commands.registerCommand(
    "scrollerPower.pageDown",
    () => {
      scroll("down", linesToScrollFullPage);
    }
  );

  const scrollUp = vscode.commands.registerCommand(
    "scrollerPower.pageUp",
    () => {
      scroll("up", linesToScrollFullPage);
    }
  );

  context.subscriptions.push(scrollHalfDown);
  context.subscriptions.push(scrollHalfUp);
  context.subscriptions.push(scrollDown);
  context.subscriptions.push(scrollUp);
}

export function deactivate() {}

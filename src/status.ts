import * as vscode from 'vscode';
import { openConfig } from './config';
import { globalContext } from './extension';
import { waitlistRegisterCommand } from './waitlist';

export class MirrordStatus {
    readonly statusBar: vscode.StatusBarItem;
    readonly toggleCommandId = 'mirrord.toggleMirroring';
    readonly settingsCommandId = 'mirrord.changeSettings';
    readonly submitFeedbackCommandId = 'mirrord.submitFeedback';
    readonly waitlistCommandId = 'mirrord.waitlistSignup';

    constructor(statusBar: vscode.StatusBarItem) {
        this.statusBar = statusBar;
    }

    draw() {
        const {
            enabled,
            statusBar,
            toggleCommandId,
            settingsCommandId,
            submitFeedbackCommandId,
            waitlistCommandId,
        } = this;

        statusBar.text = `mirrord $(${enabled ? 'circle-large-filled' : 'circle-large-outline'})`;
        statusBar.color = undefined;
        statusBar.backgroundColor = undefined;

        statusBar.command = toggleCommandId;

        statusBar.tooltip = new vscode.MarkdownString("", true);
        statusBar.tooltip.isTrusted = true;

        statusBar.tooltip.appendMarkdown(`[${enabled ? 'Enabled' : 'Disabled'}](command:${toggleCommandId})`);
        statusBar.tooltip.appendText("\n\n");
        statusBar.tooltip.appendMarkdown(`\n\n[Settings](command:${settingsCommandId})`);
        statusBar.tooltip.appendMarkdown(`\n\n[mirrord for Teams Waitlist](command:${waitlistCommandId})`);
        statusBar.tooltip.appendMarkdown(`\n\n[Submit Feedback](command:${submitFeedbackCommandId})`);

        statusBar.show();
    }

    register(): MirrordStatus {
        globalContext.subscriptions.push(vscode.commands.registerCommand(this.settingsCommandId, openConfig));
        globalContext.subscriptions.push(vscode.commands.registerCommand(this.toggleCommandId, this.toggle.bind(this)));
        globalContext.subscriptions.push(vscode.commands.registerCommand(this.submitFeedbackCommandId, this.submitFeedback.bind(this)));
        globalContext.subscriptions.push(vscode.commands.registerCommand(this.waitlistCommandId, waitlistRegisterCommand));

        globalContext.subscriptions.push(this.statusBar);

        return this;
    }

    get enabled(): boolean {
        return !!globalContext.workspaceState.get('enabled');
    }

    set enabled(val: boolean) {
        globalContext.workspaceState.update('enabled', val);
    }

    toggle() {
        if (process.platform === "win32") {
            vscode.window.showErrorMessage('mirrord is not supported on Windows. You can use it via remote development or WSL.');
            return;
        }

        this.enabled = !this.enabled;

        this.draw();
    }

    submitFeedback() {
        vscode.env.openExternal(vscode.Uri.parse('https://mirrord.dev/feedback'));
    }
}
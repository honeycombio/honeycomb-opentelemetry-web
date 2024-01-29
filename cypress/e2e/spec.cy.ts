describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('index.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'debug').as('consoleDebug');
      },
      onLoad(win) {
        console.log('onLoad', win);
      },
    });
  });
  it('initializes the OpenTelemetry API', () => {
    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      '@opentelemetry/api: Registered a global for diag',
    );
    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      '@opentelemetry/api: Registered a global for trace',
    );
    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      '@opentelemetry/api: Registered a global for context',
    );
  });

  it('logs honeycomb config with debug enabled', () => {
    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      'Honeycomb Web SDK Debug Mode Enabled',
    );
    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      '@honeycombio/opentelemetry-web',
    );
  });
  it('logs expected output with debug enabled', () => {
    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      'BrowserDetector found resource.',
    );
    cy.get('@consoleDebug').should('be.calledWithMatch', 'items to be sent');
  });
});

describe('Smoke Tests', () => {
  it('initializes the OpenTelemetry API', () => {
    cy.visit('http://localhost:3000', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'debug').as('consoleDebug');
      },
    });

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
    cy.visit('http://localhost:3000', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'debug').as('consoleDebug');
      },
    });

    cy.get('@consoleDebug').should(
      'be.calledWithMatch',
      'Honeycomb Web SDK Debug Mode Enabled',
    );

    // cy.get('@consoleDebug').should('be.calledWithMatch', {
    //   name: 'documentLoad',
    // });
    // cy.get('@consoleDebug').should('be.calledWithMatch', {
    //   name: 'resourceFetch',
    // });
    // cy.get('@consoleDebug').should('be.calledWithMatch', {
    //   name: 'documentFetch',
    // });
  });
});

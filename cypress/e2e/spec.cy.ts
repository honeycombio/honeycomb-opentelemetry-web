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

  it('logs document load traces', () => {
    cy.visit('http://localhost:3000', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'dir').as('consoleDir');
      },
    });

    cy.get('@consoleDir').should('be.calledWithMatch', {
      name: 'documentLoad',
    });
    cy.get('@consoleDir').should('be.calledWithMatch', {
      name: 'resourceFetch',
    });
    cy.get('@consoleDir').should('be.calledWithMatch', {
      name: 'documentFetch',
    });
  });
});

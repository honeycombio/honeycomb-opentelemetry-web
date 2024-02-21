describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('index.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'debug').as('consoleDebug');
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });
    cy.get('[data-cy="button"]').should('be.visible');
    cy.get('[data-cy="button"]').click();
  });
  it('initializes the OpenTelemetry API and logs honeycomb config with debug enabled', () => {
    cy.get('@consoleDebug')
      .should(
        'be.calledWithMatch',
        '@opentelemetry/api: Registered a global for diag',
      )
      .and(
        'be.calledWithMatch',
        '@opentelemetry/api: Registered a global for trace',
      )
      .and(
        'be.calledWithMatch',
        '@opentelemetry/api: Registered a global for context',
      )
      .and('be.calledWithMatch', 'Honeycomb Web SDK Debug Mode Enabled')
      .and('be.calledWithMatch', '@honeycombio/opentelemetry-web')
      .and('be.calledWithMatch', 'button clicked')
      .and('be.calledWithMatch', 'items to be sent');
  });
});

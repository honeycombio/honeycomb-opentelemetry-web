describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('index.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'debug').as('consoleDebug');
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });
    cy.get('[data-cy="button-trace"]').should('be.visible');
    cy.get('[data-cy="button-trace"]').click();
    cy.get('[data-cy="button-metric"]').should('be.visible');
    cy.get('[data-cy="button-metric"]').click();
    cy.get('[data-cy="button-log"]').should('be.visible');
    cy.get('[data-cy="button-log"]').click();
    cy.get('[data-cy="button-flush"]').should('be.visible');
    cy.get('[data-cy="button-flush"]').click();
    cy.get('[data-cy="dad-joke-button-fetch"]').should('be.visible');
    cy.get('[data-cy="dad-joke-button-fetch"]').click();
    cy.get('[data-cy="dad-joke-button-xhr"]').should('be.visible');
    cy.get('[data-cy="dad-joke-button-xhr"]').click();
    // we need to wait to let the request complete and allow time for spans to be sent
    cy.wait(5000);
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
      .and('be.calledWithMatch', 'XHR success');
  });
});

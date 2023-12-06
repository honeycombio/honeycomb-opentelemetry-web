describe('template spec', () => {
  it('should log the expected message', () => {
    cy.visit('http://localhost:3000');

    // some code to make it wait

    cy.get('#spans-go-here')
      .find('li')
      .contains('documentLoad')
      .should('exist');

    cy.get('#spans-go-here')
      .find('li')
      .contains('resourceFetch')
      .should('exist');

    cy.get('#spans-go-here')
      .find('li')
      .contains('documentFetch')
      .should('exist');
  });
});

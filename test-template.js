// Simple test script to verify template functionality
const { templates } = require('./config/templates');

console.log('Available templates:');
Object.keys(templates).forEach(key => {
  const template = templates[key];
  console.log(`\n${key}: ${template.name}`);
  console.log(`Description: ${template.description}`);
  console.log(`Sections: ${template.sections.length}`);
  
  template.sections.forEach((section, index) => {
    console.log(`  Section ${index + 1}: ${section.type}`);
    if (section.type === 'hero-section') {
      console.log(`    Heading: "${section.fields.heading}"`);
      console.log(`    CTAs: ${section.fields.ctas.length}`);
    } else if (section.type === 'call-out-cards') {
      console.log(`    Cards: ${section.fields.cards.length}`);
      section.fields.cards.forEach((card, cardIndex) => {
        console.log(`      Card ${cardIndex + 1}: "${card.heading}"`);
      });
    } else if (section.type === 'tabs-section') {
      console.log(`    Tabs: ${section.fields.tabs.length}`);
    }
  });
});

console.log('\nTemplate configuration looks good!');
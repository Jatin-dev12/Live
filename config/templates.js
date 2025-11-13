const templates = {
  home: {
    name: 'Home Template',
    description: 'Hero section with 3 callout cards',
    previewImage: '/images/templates/home-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: { 
          heading: 'Welcome to Our Website', 
          paragraph: 'Enter your hero section description here',
          ctas: [],
          rightImage: ''
        } 
      },
      {
        type: 'call-out-cards',
        fields: {
          cards: [
            { heading: 'Call Out Card 1', subheading: 'Enter your description here', link: '' },
            { heading: 'Call Out Card 2', subheading: 'Enter your description here', link: '' },
            { heading: 'Call Out Card 3', subheading: 'Enter your description here', link: '' }
          ]
        }
      }
    ]
  },
  about: {
    name: 'About Template',
    description: 'Hero section with button and tabs section',
    previewImage: '/images/templates/about-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: { 
          heading: 'About Us', 
          paragraph: 'Learn more about our organization and mission',
          ctas: [{ text: 'Learn More', link: '', style: 'primary' }],
          rightImage: ''
        } 
      },
      {
        type: 'tabs-section',
        fields: {
          tabs: [
            { title: 'Tab 1', heading: 'First Tab', paragraph: 'Content for the first tab' },
            { title: 'Tab 2', heading: 'Second Tab', paragraph: 'Content for the second tab' },
            { title: 'Tab 3', heading: 'Third Tab', paragraph: 'Content for the third tab' },
            { title: 'Tab 4', heading: 'Fourth Tab', paragraph: 'Content for the fourth tab' },
            { title: 'Tab 5', heading: 'Fifth Tab', paragraph: 'Content for the fifth tab' },
            { title: 'Tab 6', heading: 'Sixth Tab', paragraph: 'Content for the sixth tab' },
            { title: 'Tab 7', heading: 'Seventh Tab', paragraph: 'Content for the seventh tab' },
            { title: 'Tab 8', heading: 'Eighth Tab', paragraph: 'Content for the eighth tab' }
          ]
        }
      }
    ]
  },
  legislation: {
    name: 'Legislation Template',
    description: 'Hero section with 2 buttons and 1 callout card',
    previewImage: '/images/templates/legislation-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: {
          heading: 'Legislation & Policy', 
          paragraph: 'Stay informed about our legislative initiatives and policy positions',
          ctas: [
            { text: 'View Legislation', link: '', style: 'primary' },
            { text: 'Policy Documents', link: '', style: 'secondary' }
          ],
          rightImage: ''
        }
      },
      {
        type: 'call-out-cards',
        fields: {
          cards: [
            { heading: 'Call Out Card', subheading: 'Enter your description here', link: '' }
          ]
        }
      }
    ]
  },
  membership: {
    name: 'Membership Template',
    description: 'Simple hero section only',
    previewImage: '/images/templates/membership-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: { 
          heading: 'Membership', 
          paragraph: 'Join our community and become part of something greater',
          ctas: [],
          rightImage: ''
        } 
      }
    ]
  }
};

module.exports = { templates };
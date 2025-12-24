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
          paragraph: 'Enter hero section description here',
          ctas: [
            { text: 'Get Started', link: '', style: 'primary' },
            { text: 'Learn More', link: '', style: 'secondary' }
          ],
          image: ''
        } 
      },
      {
        type: 'call-out-cards',
        fields: {
          cards: [
            { heading: 'Call Out Card 1', subheading: 'Enter description here', link: '' },
            { heading: 'Call Out Card 2', subheading: 'Enter description here', link: '' },
            { heading: 'Call Out Card 3', subheading: 'Enter description here', link: '' }
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
          image: ''
        } 
      },
      {
        type: 'tabs-section',
        fields: {
          tabs: [
            { title: '', heading: '', paragraph: '' },
            { title: '', heading: '', paragraph: '' },
            { title: '', heading: '', paragraph: '' }
          ]
        },
        placeholders: {
          tabs: [
            { title: 'Tab 1', heading: 'First Tab', paragraph: 'Content for the first tab' },
            { title: 'Tab 2', heading: 'Second Tab', paragraph: 'Content for the second tab' },
            { title: 'Tab 3', heading: 'Third Tab', paragraph: 'Content for the third tab' }
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
          image: ''
        }
      },
      {
        type: 'call-out-cards',
        fields: {
          cards: [
            { heading: 'Call Out Card', subheading: 'Enter description here', link: '' }
          ]
        }
      }
    ]
  },
  membership: {
    name: 'Membership Template',
    description: 'Hero section with buttons and community groups',
    previewImage: '/images/templates/membership-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: { 
          heading: '', 
          paragraph: '',
          ctas: [
            { text: '', link: '', style: 'primary' },
            { text: '', link: '', style: 'secondary' }
          ],
          rightImage: ''
        },
        placeholders: {
          heading: 'Join Our Community',
          paragraph: 'Become a member and connect with like-minded individuals in our community',
          ctas: [
            { text: 'Join Now', link: '/membership/join' },
            { text: 'Learn More', link: '/membership/about' }
          ]
        }
      },
      {
        type: 'community-groups',
        fields: {
          heading: '',
          subheading: '',
          category: 'community',
          displayOrder: 'manual'
        },
        placeholders: {
          heading: 'Community Groups',
          subheading: 'Explore our various community groups and find your perfect fit'
        }
      }
    ]
  },
  newsletter: {
    name: 'Newsletter Template',
    description: 'Hero section with button and tabs section',
    previewImage: '/images/templates/newsletter-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: { 
          heading: 'Newsletter', 
          paragraph: 'Stay updated with our latest news and updates',
          ctas: [{ text: 'Subscribe Now', link: '', style: 'primary' }],
          image: ''
        } 
      },
      {
        type: 'tabs-section',
        fields: {
          tabs: [
            { title: '', heading: '', paragraph: '' },
            { title: '', heading: '', paragraph: '' },
            { title: '', heading: '', paragraph: '' }
          ]
        },
        placeholders: {
          tabs: [
            { title: 'Tab 1', heading: 'First Tab', paragraph: 'Content for the first tab' },
            { title: 'Tab 2', heading: 'Second Tab', paragraph: 'Content for the second tab' },
            { title: 'Tab 3', heading: 'Third Tab', paragraph: 'Content for the third tab' }
          ]
        }
      }
    ]
  },
  query: {
    name: 'Query Template',
    description: 'Hero section with heading, subheading and multiple CTAs',
    previewImage: '/images/templates/query-template-preview.svg',
    sections: [
      { 
        type: 'hero-section', 
        fields: { 
          heading: '', 
          paragraph: '',
          ctas: [
            { text: '', link: '', style: 'primary' },
            { text: '', link: '', style: 'secondary' },
            { text: '', link: '', style: 'outline' }
          ],
          image: ''
        },
        placeholders: {
          heading: 'Have a Query?',
          paragraph: 'Get in touch with us for any questions or support you need',
          ctas: [
            { text: 'Contact Us', link: '/contact' },
            { text: 'Submit Query', link: '/query' },
            { text: 'Call Now', link: 'tel:+1234567890' }
          ]
        }
      }
    ]
  },
  contact: {
    name: 'Contact Template',
    description: 'Contact page with email, phone, form and helpful links',
    previewImage: '/images/templates/contact-template-preview.svg',
    sections: [
      {
        type: 'contact-section',
        fields: {
          heading: 'Contact ACRM',
          subheading: 'Get in touch with our team',
          email: {
            heading: 'Email Member Services',
            subheading: 'Send us an email for support',
            address: ''
          },
          call: {
            heading: 'Call',
            subheading: 'Mon-Fri, 9:00-5:00 ET',
            phone: ''
          },
          generalContactForm: {
            heading: 'General Contact Form',
            subheading: 'Route your message to the right team',
            openFormLink: ''
          },
          helpfulLinks: [
            { text: 'Member Login/Account Help', link: '' },
            { text: 'Publications', link: '' },
            { text: 'Conference & Registration', link: '' }
          ]
        }
      }
    ]
  },
  custom: {
    name: 'Custom Template',
    description: 'Empty template with custom section functionality - add your own sections',
    previewImage: '/images/templates/custom-template-preview.svg',
    sections: []
  }
};

module.exports = { templates };
import './style.css'

let options = {
  publishableKey: 'pk_sandbox_MGxmn6NR0X-AggKVIog13TJZDzpiEuMbh8HeLih',
  organizationId: 'phronesis-friendfinder',
  websiteId: 'www.ff.com',
  apiMode: 'sandbox',
  items: [
      {
          planId: 'premium-membership-monthly',
          quantity: 1,
      }
  ],
  addons: [
      {
          planId: 'personalized-travel-plan',
          quantity: 1
      }
  ],
  bumpOffer: [
      {
          planId: 'platinum-membership-monthly',
          quantity: 1,
      }
  ],
  theme: {
      colorPrimary: '#F9740A', // Brand color
      colorText: '#333333', // Text color
      colorDanger: '#F9740A',
      buttonColorText: '#ffffff',
      fontFamily: 'Trebuchet MS, sans-serif' // Website font family
  },
  i18n: {
      en: {
          form: {
              bumpOffer: {
                  title: 'Yes, I want to upgrade!'
              }
          }
      }
  }
};

const yearlyCheckbox = document.querySelector('#yearly');
const checkboxLabel = document.querySelector('.checkbox-wrapper label');

yearlyCheckbox.addEventListener('change', function () {
  if (this.checked) {
      checkboxLabel.innerText = 'Change to monthly pricing';
      RebillyInstruments.update({
          items: [
              {
                  planId: 'premium-membership-yearly',
                  quantity: 1,
              }
          ],
          bumpOffer: [
              {
                  planId: 'platinum-membership-yearly',
                  quantity: 1,
              }
          ],
      })
  } else {
      checkboxLabel.innerText = 'Change to yearly pricing';
      RebillyInstruments.update(options);
  }
})

// Mount Rebilly Instruments
RebillyInstruments.mount(options);
// Optional
RebillyInstruments.on('instrument-ready', (instrument) => {
  console.info(instrument);
});
RebillyInstruments.on('purchase-completed', (purchase) => {
  console.info('purchase-completed', purchase);
  yearlyCheckbox.disabled = true;
});


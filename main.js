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
            },
            consentCheck: {
                agreeToTOS: 'I agree to the [terms and conditions](https://www.example.com/tos), and [subscription billing policy](https://www.example.com/tos).',
            },
        }
    },
    features: {
        showConsentCheck: ['confirmation'],
    }
};

const periodButtons = document.querySelectorAll('.period-btn');
periodButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        selectPeriod(button, button.textContent);
    })
})

function selectPeriod(button, textContent) {
    // Remove active class from all buttons
    periodButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button
    button.classList.add('active');

    if (textContent.toLowerCase() === 'yearly') {
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
        });
    } else {
        RebillyInstruments.update(options);
    }
}

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


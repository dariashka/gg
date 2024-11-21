import RebillyAPI from "rebilly-js-sdk";

const state = {
    amount: 100,
    customerId: 'test-customer',
    organizationId: 'gamble-garden',
    websiteId: 'www.gamblegarden.com',
    loaderEl: document.querySelector('.loader'),
    currency: 'USD',
    payoutRequestId: '',
}

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: state.organizationId,
    sandbox: true,
});

async function initRequest() {
    const response = {};
    const data = {
        mode: "passwordless",
        customerId: state.customerId,
    };
    const {fields: login} = await api.customerAuthentication.login({
        data,
    });
    const {fields: exchangeToken} =
        await api.customerAuthentication.exchangeToken({
            token: login.token,
            data: {
                acl: [
                    {
                        scope: {
                            organizationId: state.organizationId,
                        },
                        permissions: [
                            "PostToken",
                            "StorefrontGetPaymentInstrumentCollection",
                            "StorefrontPostPaymentInstrument",
                            "StorefrontGetPaymentInstrument",
                            "StorefrontPatchPaymentInstrument",
                            "StorefrontGetAccount",
                            "StorefrontGetWebsite",
                            "StorefrontPostReadyToPay",
                            "StorefrontGetPayoutRequestCollection",
                            "StorefrontGetPayoutRequest",
                            "StorefrontPatchPayoutRequest",
                            "StorefrontPostReadyToPayout",
                        ],
                    },
                ],
                customClaims: {
                    websiteId: state.websiteId,
                },
            },
        });

    console.log(state);

    response.token = exchangeToken.token;
    state.token = response.token;

    await requestPayout();
}

async function requestPayout() {
    const {fields} = await api.payoutRequests.create({
        data: {
            websiteId: state.websiteId,
            customerId: state.customerId,
            currency: 'USD',
            amount: state.amount,
        }
    });

    state.payoutRequestId = fields.id;
}

async function initInstruments() {
    let options = {
        apiMode: 'sandbox',
        theme: {
            colorPrimary: '#333333', // Brand color
            colorText: '#333', // Text color
            colorDanger: '#F9740A',
            buttonColorText: '#ffffff',
            fontFamily: 'Trebuchet MS, sans-serif' // Website font family
        },
        payout: {
            payoutRequestId: state.payoutRequestId,
        },
        jwt: state.token,
    };

    RebillyInstruments.mount(options);
}

document.getElementById('payoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    state.amount = e.target.amount.value;
    init();
});

async function init() {
    document.getElementById('payment-instruments-card').style.display = 'flex';
    state.loaderEl.style.display = 'block';
    await initRequest();
    await initInstruments();
    state.loaderEl.style.display = 'none';
}



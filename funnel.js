import {RebillyStorefrontAPI} from 'rebilly-js-sdk';

const api = RebillyStorefrontAPI({
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

api.setSessionToken('pk_sandbox_MGxmn6NR0X-AggKVIog13TJZDzpiEuMbh8HeLih');

const handler = {
    get: (target, property) => {
        return Reflect.get(target, property);
    },
    set: async (target, property, value) => {
        const updatedState = Reflect.set(target, property, value);
        if (property === 'liveReplay' || (property === 'partnerTicket' || property === 'numberOfPartners')) {
            renderSummary();
        }
        return updatedState;
    }
}

const state = new Proxy({
    liveReplay: null,
    partnerTicket: null,
    numberOfPartners: null,
    plans: {
        basic: 'funnel-hacking-basic',
        replays: 'funnel-hacking-replays',
        partners: 'funnel-hacking-partners',
    },

    paymentToken: null,
}, handler);

Framepay.initialize({
    publishableKey: "pk_sandbox_MGxmn6NR0X-AggKVIog13TJZDzpiEuMbh8HeLih",
    icon: {
        color: "#2c3e50",
    },
    style: {
        base: {
            fontSize: "16px",
            boxShadow: "none",
        },
    },
});

const elements = {
    form: document.querySelector('form'),
    framepay: document.querySelector('.framepay-mounting-point'),
    framepayCvv: document.querySelector('.framepay-cvv'),
    framepayExp: document.querySelector('.framepay-exp'),
    inputReplays: document.querySelector('#replays'),
    inputPartners: document.querySelector('#partners'),
    inputPartnersQty: document.querySelector('#qty'),
    formSummaryItems: document.querySelector('.form-summary-items'),
    framepayErrors: document.querySelector('.form-framepay-errors'),
    loader: document.querySelector('.form-loader'),
    result: document.querySelector('.result'),
};

function formatPrice(price) {
    const newIntl = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return newIntl.format(price);
}

function renderSummary() {
    const liveReplayTemplate = () => state.liveReplay ? `
        <div class="form-summary-item">
            <p>Funnel Hacking LIVE Replays</p>
            <p>${formatPrice(97)}</p>
        </div>
    ` : '';
    const extraPartner = () => state.partnerTicket ? `
        <div class="form-summary-item">
            <p>Funnel Hacking LIVE Partner (${state.numberOfPartners})</p>
            <p>${formatPrice(Number(state.numberOfPartners) * 697)}</p>
        </div>
    `: '';

    elements.formSummaryItems.innerHTML = `
        <div class="form-summary-item">
            <p>Funnel Hacking LIVE (FHL10)</p>
            <p>${formatPrice(997)}</p>
        </div>
        ${liveReplayTemplate()}
        ${extraPartner()}
    `
}

function bindELements() {
    elements.inputReplays.addEventListener('change', (e) => {
        state.liveReplay = e.target.checked;
    });

    elements.inputPartners.addEventListener('change', (e) => {
        elements.inputPartnersQty.classList.toggle('is-not-visible');
        state.partnerTicket = e.target.checked;
        state.numberOfPartners = state.partnerTicket ? 1 : null;
    });

    elements.inputPartnersQty.addEventListener('input', (e) => {
        state.numberOfPartners = e.target.value;
    });
}

function renderFramepayErrors() {
    const errors = [];
    return function(error = null, type = '') {
        if (error) {
            if (!errors.includes(error.code)) {
                errors.push(error.code);
                elements.framepayErrors.innerHTML += `
                    <div class="${error.code}">${error.message}</div>         
                `;
            }
        } else {
            const idx = errors.indexOf(type);
            errors.splice(idx, 1);
            const el = elements.framepayErrors.querySelector(`.${type}`);

            if (el) el.remove();
            elements.framepayErrors.innerHTML = elements.framepayErrors.innerHTML.trim();
        }
    }
}

Framepay.on("ready", function () {
    const card = Framepay.card.mount(elements.framepay, 'cardNumber');
    const exp = Framepay.card.mount(elements.framepayExp, 'cardExpiration');
    const cvv = Framepay.card.mount(elements.framepayCvv, 'cardCvv');

    const validateFramepay = renderFramepayErrors();

    card.on('change', function(e) {
        const {error} = e;
        validateFramepay(error, 'invalid-number');
    });
    exp.on('change', function(e) {
        const {error} = e;
        validateFramepay(error, 'invalid-expiration');
    });
    cvv.on('change', function(e) {
        const {error} = e;
        validateFramepay(error, 'incomplete-cvv');
    });
});

async function processPurchase() {
    const data = {
        websiteId: 'www.ff.com',
        items: [
            {
                planId: state.plans.basic,
                quantity: 1,
            },
            (state.liveReplay ? {
                planId: state.plans.replays,
                quantity: 1,
            } : null),
            (state.partnerTicket ? {
                planId: state.plans.partners,
                quantity: Number(state.numberOfPartners),
            } : null),

        ].filter(item => item),
        billingAddress: state.paymentToken?.billingAddress,
        paymentInstruction: {
            token: state.paymentToken.id,
        }
    };

    const {fields} = await api.purchase.purchase({data});
    return fields;
}

function diplayResult({invoice, transaction}) {
    console.log({invoice, transaction});
    elements.form.style.display = 'none';
    elements.result.style.display = 'block';

    elements.result.innerHTML = `
    <h1 style="line-height: 1.3;">
        ${(transaction.result === "approved") ? `
            Thank you ${transaction.billingAddress.firstName} ${transaction.billingAddress.lastName} for your purchase!
        ` : `Something went wrong please contact support`}
    </h1>
    ${(transaction.result === "approved") ? `
        <br />
            <p>We will email you your purchase details!</p>
        <br />
    ` : `
        <br />
            <p>Our team will help you sort this one out</p>
            <p>Email us at: <a>support@fhl.com</a></p>
            <p>Call us at: +1 514 679 1190</p>
        <br />
    `}
    <table>
        <colgroup>
            <col width="80%">
            <col width="10%">
            <col width="10%">
        </colgroup>
        <tr>
            <th>Item</th>
            <th style="text-align: right">Quantity</th>
            <th style="text-align: right">Price</th>
        </tr>
        ${(invoice.items.map(item => {
            return `
            <tr>
                <td>${item.planId}</td>
                <td style="text-align: right">${item.quantity}</td>
                <td style="text-align: right">${formatPrice(item.price)}</td>
            </tr>
            `;
        }).join(''))}
        <tr class="totals">
            <td style="text-align: right">Sub Total</td><td></td>
            <td style="text-align: right">
                ${formatPrice(invoice.subtotalAmount)}
            </td>
        </tr>
        <tr class="totals">
            <td style="text-align: right">Taxes</td><td></td>
            <td style="text-align: right">
                ${formatPrice(invoice.tax.amount)}
            </td>
        </tr>
        <tr class="totals amount">
            <td style="text-align: right">Total</td><td></td>
            <td style="text-align: right">
                ${formatPrice(invoice.amount)}
            </td>
        </tr>
    </table>
    `;
}

console.log(api)

elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
        elements.loader.classList.toggle('is-hidden');
        const token = await Framepay.createToken(elements.form);
        state.paymentToken = token;

        const result = await processPurchase();
        diplayResult(result);
    } catch (error) {
        console.log(error);
    } finally {
        elements.loader.classList.toggle('is-hidden');
    }

    console.log(state)
});


function init() {
    bindELements();
}

init();

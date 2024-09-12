import './style.css';
import RebillyAPI from 'rebilly-js-sdk';

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

const state = {
    customerId: 'cus_01J7CH07DZGYKT0PZTQ3RE8C9H',
    fullAmount: 500,
    percetange: '20',
    customAmount: '',
    amount: 0,
    token: null,
    invoiceId: null,
    transactionId: null,
    hpfLink: null,
};

const buttons = document.querySelectorAll('.btn');
const depositButton = document.querySelectorAll('.deposit-button');
const depositInput = document.querySelector('.deposit-input');
const features = document.querySelector('section.features');
const deposit = document.querySelector('section.deposit');
const makeDepositButton = document.getElementById('make-deposit');

deposit.style.display = 'none';

buttons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        features.style.display = 'none';
        deposit.style.display = 'block';
    });
});

depositButton.forEach(button => {
    button.addEventListener('click', async (e) => {
        depositInput.value = '';
        state.customAmount = '';
        depositButton.forEach(b => b.classList.remove('is-active'));
        e.preventDefault();
        state.percetange = button.dataset.deposit;
        e.target.classList.add('is-active');
        updateAmount();
    });
});

depositInput.addEventListener('input', ({target}) => {
    state.customAmount = target.value;
    updateAmount();
});

makeDepositButton.addEventListener('click', async () => {
    if (state.customAmount && depositInput.checkValidity() === false) {
        depositInput.reportValidity();
        return;
    }

    updateAmount();
    toggleButtons();
    await createOrder();
    await createTransaction();
    toggleButtons();
});

function updateAmount() {
    state.amount = state.customAmount ? Number(state.customAmount) : state.fullAmount * (Number(state.percetange) / 100);
    makeDepositButton.innerHTML = `Continue with $${state.amount}.00`;
}

async function createOrder() {
    const sub = await api.subscriptions.create({
        data: {
            orderType: 'one-time-order',
            customerId: state.customerId,
            websiteId: 'www.ff.com',
            items: [
                { 
                    plan: {
                        id: 'rent-villa-base',
                    },
                    quantity: 1,
                },
            ],
        }
    });

    state.invoiceId = sub.fields.recentInvoiceId;
}

async function createTransaction() {
    const transaction = await api.transactions.create({
        data: {
            customerId: state.customerId,
            type: 'sale',
            currency: 'USD',
            amount: state.amount,
            websiteId: 'www.ff.com',
            isMerchantInitiated: true,
            isProcessedOutside: false,
            paymentInstruction: {methods: []},
            methods: [],
            invoiceIds: [state.invoiceId],
        }
    });

    state.transactionId = transaction.fields.id;
    state.hpfLink = transaction.fields._links.find(link => link.rel === 'approvalUrl').href;
    window.open(state.hpfLink, '_blank');
}

function toggleButtons() {
    buttons.forEach(button => {
        button.disabled = !button.disabled ;
    });
}
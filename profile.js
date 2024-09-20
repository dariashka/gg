import './style.css';
import RebillyAPI from 'rebilly-js-sdk';

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

const state = {
    customerId: 'cus_01J7CH07DZGYKT0PZTQ3RE8C9H',
    invoices: [],
    isLoading: true,
};

const table = document.querySelector('table');
const loading = document.getElementById('loading');

function toggleLoading() {
    table.style.display = state.isLoading ? 'none' : 'table';
    loading.style.display = state.isLoading ? 'block' : 'none';
}

const payable = ['unpaid', 'past-due', 'partially-paid', 'quotation']

function formatDate(date) {
    return new Date(date).toDateString();
}

function unKebabCase(string) {
    return string.replace(/-/g, ' ');
}

function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
        amount,
    );
}


function renderTable() {
    const tbody = table.querySelector('tbody');
    state.invoices.forEach(invoice => {
        let actions = ``;
        if (payable.includes(invoice.status)) {
            actions = `
            <a target="_blank" href="${invoice.paymentFormUrl}">Pay</a>
        `
        }
        tbody.innerHTML += `
            <tr>
                    <td>${formatDate(invoice.issuedTime)}</td>
                    <td>${unKebabCase(invoice.status)}</td>
                    <td class="align-right">${formatMoney(invoice.amount)}</td>
                    <td class="actions">
                        ${actions}
                    </td>
                </tr>        
        `;
    })
}

async function fetchInvoices() {
    await api.invoices.getAll({filter: `customerId:${state.customerId}`})
        .then(({items}) => {
            state.invoices = items.map(({fields}) => fields);
        });
}

async function init() {
    toggleLoading();
    await fetchInvoices();
    state.isLoading = false;
    toggleLoading();
    renderTable();
}

init();
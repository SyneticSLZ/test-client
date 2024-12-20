// Constants and Config
const API_BASE_URL = 'http://server.voltmailer.com/api';



// API Functions
async function fetchFDAFilings() {
    try {
        const response = await fetch(`${API_BASE_URL}/fda-filings`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching FDA filings:', error);
        showNotification('Error fetching FDA filings', 'error');
        return [];
    }
}

async function fetchPatents() {
    try {
        const response = await fetch(`${API_BASE_URL}/patents`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching patents:', error);
        showNotification('Error fetching patents', 'error');
        return [];
    }
}

async function fetchFCCSubmissions() {
    try {
        const response = await fetch(`${API_BASE_URL}/fcc-submissions`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching FCC submissions:', error);
        showNotification('Error fetching FCC submissions', 'error');
        return [];
    }
}

async function fetchFundingRounds() {
    try {
        const response = await fetch(`${API_BASE_URL}/funding-rounds`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching funding rounds:', error);
        showNotification('Error fetching funding rounds', 'error');
        return [];
    }
}

// Company Management
async function addToCompanies(companyData) {
    try {
        // // First, enrich the company data
        // const enrichedData = await fetch(`${API_BASE_URL}/enrich-company`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ companyName: companyData.name }),
        // }).then(res => res.json());

        // // Merge enriched data with basic company data
        // const enhancedCompany = {
        //     ...companyData,
        //     enrichedData,
        //     id: Date.now(),
        //     addedDate: new Date().toISOString().split('T')[0]
        // };

        let companies = JSON.parse(localStorage.getItem('trackedCompanies') || '[]');
        if (!companies.find(c => c.name === companyData.name)) {
            companies.push(companyData);
            localStorage.setItem('trackedCompanies', JSON.stringify(companies));
            showNotification(`${companyData.name} added to your companies!`);
            updateCompaniesTable();
        }
    } catch (error) {
        console.error('Error adding company:', error);
        showNotification('Error adding company', 'error');
    }
}

function removeCompany(companyId) {
    let companies = JSON.parse(localStorage.getItem('trackedCompanies') || '[]');
    companies = companies.filter(c => c.id !== companyId);
    localStorage.setItem('trackedCompanies', JSON.stringify(companies));
    updateCompaniesTable();
    showNotification('Company removed successfully!');
}

// Campaign Management
async function createCampaign() {
    const name = document.getElementById('campaign-name').value;
    const content = document.getElementById('campaign-content').value;
    const selectedCompanies = Array.from(document.querySelectorAll('.company-checkbox:checked')).map(cb => cb.value);
    
    const campaignData = {
        name,
        content,
        companies: selectedCompanies,
        status: 'draft',
        created: new Date().toISOString(),
        sent: 0,
        opened: 0,
        responded: 0,
        lastModified: new Date().toISOString()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(campaignData),
        });

        const campaign = await response.json();
        hideModal();
        updateCampaignDashboard();
        updateCampaignsTable();
        showNotification('Campaign created successfully!');
    } catch (error) {
        console.error('Error creating campaign:', error);
        showNotification('Error creating campaign', 'error');
    }
}

// Table Updates
// async function updateFDATable() {
//     const filings = await fetchFDAFilings();
//     const tableBody = document.getElementById('fda-table-body');
    
//     if (!tableBody) return;

//     tableBody.innerHTML = filings.map(filing => `
//         <tr>
//             <td class="px-6 py-4 whitespace-nowrap">${filing.company}</td>
//             <td class="px-6 py-4 whitespace-nowrap">${filing.type}</td>
//             <td class="px-6 py-4 whitespace-nowrap">${filing.date}</td>
//             <td class="px-6 py-4 whitespace-nowrap">
//                 <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
//                     ${filing.status}
//                 </span>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap text-sm">
//                 <button class="text-blue-600 hover:text-blue-900" onclick='addToCompanies(${JSON.stringify({
//                     name: filing.company,
//                     industry: "Healthcare",
//                     source: "FDA Filing"
//                 })})'>
//                     Add to Companies
//                 </button>
//             </td>
//         </tr>
//     `).join('');
// }

async function updateFDATable() {
    const tableBody = document.getElementById('fda-table-body');
    if (!tableBody) return;

    // Enhanced loading state with shimmer effect
    tableBody.innerHTML = Array(5).fill(`
        <tr class="animate-pulse">
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
            <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
        </tr>
    `).join('');

    try {
        const filings = await fetchFDAFilings();
        
        tableBody.innerHTML = filings.map(filing => `
            <tr class="hover:bg-gray-50 border-b border-gray-200 transition duration-150 ease-in-out">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-blue-600 font-semibold">
                                    ${filing.company.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${filing.company}</div>
                            <div class="text-sm text-gray-500">${filing.category || 'Healthcare'}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${getFilingTypeClass(filing.type)}">
                            ${filing.type}
                        </span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        ID: ${filing.id || 'N/A'}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${formatDate(filing.date)}</div>
                    <div class="text-xs text-gray-500">${filing.date}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getStatusClass(filing.status)}">
                        ${filing.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-right space-x-3">

                    <button onclick='addToCompanies(${JSON.stringify({
                        name: filing.company,
                        industry: "Healthcare",
                        source: "FDA Filing"
                    })})'
                            class="text-green-600 hover:text-green-900 text-sm font-medium">
                        Track
                    </button>
                </td>
            </tr>
        `).join('');

        // Add click handler for entire row
        tableBody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const filing = filings[row.rowIndex - 1];
                    viewFilingDetails(filing);
                }
            });
        });

    } catch (error) {
        console.error('Error loading FDA filings:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="flex flex-col items-center justify-center py-12">
                        <div class="rounded-full bg-red-100 p-3 mb-4">
                            <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                        <p class="text-gray-500 mb-4">Unable to load FDA filings. Please try again.</p>
                        <button onclick="updateFDATable()" 
                                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                            <i class="fas fa-redo mr-2"></i>
                            Retry
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Helper function for filing type styling
function getFilingTypeClass(type) {
    const classes = {
        'New Drug Application': 'bg-purple-100 text-purple-800',
        'Generic Drug': 'bg-green-100 text-green-800',
        'Medical Device': 'bg-blue-100 text-blue-800',
        'Supplement': 'bg-yellow-100 text-yellow-800',
        'default': 'bg-gray-100 text-gray-800'
    };
    return classes[type] || classes.default;
}

// Helper function for status styling
function getStatusClass(status) {
    const classes = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Under Review': 'bg-blue-100 text-blue-800',
        'default': 'bg-gray-100 text-gray-800'
    };
    return classes[status] || classes.default;
}

// Viewing filing details
function viewFilingDetails(filing) {
    const modalContent = `
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Filing Details</h2>
                <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                <!-- Header Info -->
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-900">${filing.company}</h3>
                            <p class="text-sm text-gray-500 mt-1">Filing ID: ${filing.id || 'N/A'}</p>
                        </div>
                        <span class="px-4 py-2 rounded-full text-sm font-semibold
                            ${getStatusClass(filing.status)}">
                            ${filing.status}
                        </span>
                    </div>
                </div>

                <!-- Filing Details -->
                <div class="p-6 grid grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Filing Type</h4>
                        <p class="text-base text-gray-900">${filing.type}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Submission Date</h4>
                        <p class="text-base text-gray-900">${formatDate(filing.date)}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Category</h4>
                        <p class="text-base text-gray-900">${filing.category || 'Healthcare'}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Review Timeline</h4>
                        <p class="text-base text-gray-900">${filing.reviewTimeline || '6-10 months'}</p>
                    </div>
                </div>

                <!-- Additional Information -->
                <div class="px-6 py-4 bg-gray-50">
                    <h4 class="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p class="text-base text-gray-900">${filing.description || 'No description available.'}</p>
                </div>

                <!-- Action Buttons -->
                <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div class="flex justify-end space-x-3">
                        <button onclick="generateFilingReport('${filing.id}')"
                                class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                            <i class="fas fa-download mr-2"></i>
                            Download Report
                        </button>
                        <button onclick='addToCompanies(${JSON.stringify({
                            name: filing.company,
                            industry: "Healthcare",
                            source: "FDA Filing"
                        })})'
                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                            <i class="fas fa-plus mr-2"></i>
                            Track Company
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalContent);
}

// Helper function for time ago
function getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(date);
}

// Helper function for date formatting
// function formatDate(dateString) {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
// }

// async function updatePatentsTable() {
//     const patents = await fetchPatents();
//     const tableBody = document.getElementById('patents-table-body');
    
//     if (!tableBody) return;
// console.log(patents[0])
//     tableBody.innerHTML = patents.map(patent => `
//         <tr>
//             <td class="px-6 py-4 whitespace-nowrap">${patent.title}</td>
//             <td class="px-6 py-4 whitespace-nowrap">${patent.asignee}</td>
//             <td class="px-6 py-4 whitespace-nowrap">${patent.issueDate}</td>  
//             <td class="px-6 py-4 whitespace-nowrap">
//                 <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
//                     ${patent.status}
//                 </span>
//             </td>
//             <td class="px-6 py-4 whitespace-nowrap text-sm">
//                 <button class="text-blue-600 hover:text-blue-900" onclick='addToCompanies(${JSON.stringify({
//                     name: patent.asignee,
//                     industry: "Technology",
//                     source: "Patent Filing"
//                 })})'>
//                     Add to Companies
//                 </button>
//             </td>
//         </tr>
//     `).join('');
// }
async function updatePatentsTable() {
    const tableBody = document.getElementById('patents-table-body');
    if (!tableBody) return;

    // First, set fixed widths for the table columns
    const tableHeader = tableBody.closest('table').querySelector('thead');
    if (tableHeader) {
        tableHeader.innerHTML = `
            <tr class="bg-white border-b border-gray-100">
                <th class="w-[35%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patent Title</th>
                <th class="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th class="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filed Date</th>
                <th class="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
        `;
    }

    // Loading state with fixed widths
    tableBody.innerHTML = Array(5).fill(`
        <tr class="animate-pulse border-b border-gray-100">
            <td class="w-[35%] px-6 py-4">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div class="flex-1">
                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </td>
            <td class="w-[25%] px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </td>
            <td class="w-[15%] px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td class="w-[15%] px-6 py-4">
                <div class="h-6 bg-gray-200 rounded-full w-24"></div>
            </td>
            <td class="w-[10%] px-6 py-4">
                <div class="h-8 bg-gray-200 rounded w-20"></div>
            </td>
        </tr>
    `).join('');

    try {
        const patents = await fetchPatents();
        
        // Update table content with fixed widths and better text handling
        tableBody.innerHTML = patents.map(patent => `
            <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="w-[35%] px-6 py-4">
                    <div class="flex items-center space-x-3 min-w-0">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-lightbulb text-blue-500 text-sm"></i>
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-sm font-medium text-gray-900 truncate">
                                ${patent.title}
                            </div>
                            <div class="text-xs text-gray-500 truncate">
                                ID: ${patent.id || 'N/A'}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="w-[25%] px-6 py-4">
                    <div class="flex items-center space-x-2 min-w-0">
                        <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-sm font-medium text-gray-600">
                                ${patent.asignee?.charAt(0) || '?'}
                            </span>
                        </div>
                        <span class="text-sm text-gray-900 truncate">
                            ${patent.asignee}
                        </span>
                    </div>
                </td>
                <td class="w-[15%] px-6 py-4">
                    <div class="text-sm text-gray-900 whitespace-nowrap">
                        ${formatDate(patent.issueDate)}
                    </div>
                </td>
                <td class="w-[15%] px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap
                        ${getStatusClass(patent.status)}">
                        ${getShortStatus(patent.status)}
                    </span>
                </td>
                <td class="w-[10%] px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button class="p-1 text-gray-400 hover:text-blue-600 transition-colors" >
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="p-1 text-blue-600 hover:text-blue-800 transition-colors" onclick='addToCompanies(${JSON.stringify({
                            name: patent.asignee,
                            industry: "Healthcare",
                            source: "Patent"
                        })})' >
                            <i class="fas fa-plus" onclick='addToCompanies(${JSON.stringify({
                            name: patent.asignee,
                            industry: "Healthcare",
                            source: "Patent"
                        })})' > </i>
                        </button>

                                            <button onclick='addToCompanies(${JSON.stringify({
                        name: patent.asignee,
                        industry: "Healthcare",
                        source: "FDA Filing"
                    })})'
                            class="text-green-600 hover:text-green-900 text-sm font-medium">
                        Track
                    </button>

                    </div>
                </td>
            </tr>
        `).join('');

        // Add click handlers
        tableBody.querySelectorAll('tr').forEach((row, index) => {
            row.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    showPatentDetails(patents[index]);
                }
            });
        });

    } catch (error) {
        console.error('Error loading patents:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center">
                    <div class="text-gray-500">
                        <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                        <p>Failed to load patents</p>
                        <button onclick="updatePatentsTable()" 
                                class="mt-2 text-blue-600 hover:text-blue-800">
                            Try again
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Helper function to shorten status text
function getShortStatus(status) {
    const statusMap = {
        'Granted Patent (Previously published)': 'Granted',
        'Patent (No previous application)': 'Granted',
        'Published': 'Published',
    };
    return statusMap[status] || status;
}

function showPatentDetails(patent) {
    const modalContent = `
        <div class="bg-white rounded-lg max-w-lg mx-auto">
            <div class="px-6 py-4 border-b border-gray-100">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-medium">Patent Details</h2>
                    <button onclick="hideModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <h3 class="text-lg font-medium text-center mb-4">${patent.title}</h3>
                
                <div class="text-center mb-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClassP(patent.status)}">
                        ${patent.status}
                    </span>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">Patent ID:</span>
                        <span class="font-medium">${patent.id}</span>
                    </div>
                    
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">Assignee:</span>
                        <span class="font-medium">${patent.asignee}</span>
                    </div>
                    
                    <div class="flex justify-between py-2 border-b border-gray-100">
                        <span class="text-gray-500">Issue Date:</span>
                        <span class="font-medium">${formatDateP(patent.issueDate)}</span>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                <a href="#" class="text-blue-600 hover:text-blue-800 px-4 py-2 text-sm font-medium">
                    View Original
                </a>
                <button class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    Track Company
                </button>
            </div>
        </div>
    `;

    showModal(modalContent);
}

function getStatusClassP(status) {
    return {
        'Granted Patent (Previously published)': 'bg-green-100 text-green-800',
        'Patent (No previous application)': 'bg-blue-100 text-blue-800',
        'Published': 'bg-yellow-100 text-yellow-800',
        'default': 'bg-gray-100 text-gray-800'
    }[status] || 'bg-gray-100 text-gray-800';
}

function formatDateP(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

async function updateFCCTable() {
    const submissions = await fetchFCCSubmissions();
    const tableBody = document.getElementById('fcc-table-body');
    
    if (!tableBody) return;

    tableBody.innerHTML = submissions.map(submission => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">${submission.company}</td>
            <td class="px-6 py-4 whitespace-nowrap">${submission.type}</td>
            <td class="px-6 py-4 whitespace-nowrap">${submission.date}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    submission.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    submission.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }">
                    ${submission.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-900" onclick='addToCompanies(${JSON.stringify({
                    name: submission.company,
                    industry: "Telecommunications",
                    source: "FCC Filing"
                })})'>
                    Add to Companies
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateFundingTable() {
    const fundingRounds = await fetchFundingRounds();
    const tableBody = document.getElementById('funding-table-body');
    
    if (!tableBody) return;

    tableBody.innerHTML = fundingRounds.map(round => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">${round.company}</td>
            <td class="px-6 py-4 whitespace-nowrap">${round.type}</td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">${round.amount}</td>
            <td class="px-6 py-4 whitespace-nowrap">${round.date}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                    ${round.investors.map(investor => `
                        <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            ${investor}
                        </span>
                    `).join('')}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-900" onclick='addToCompanies(${JSON.stringify({
                    name: round.company,
                    industry: "Technology",
                    source: "Funding Round"
                })})'>
                    Add to Companies
                </button>
            </td>
        </tr>
    `).join('');
}

function updateCompaniesTable() {
    const companies = JSON.parse(localStorage.getItem('trackedCompanies') || '[]');
    const tableBody = document.getElementById('companies-table-body');
    
    if (!tableBody) return;

    tableBody.innerHTML = companies.map(company => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <input type="checkbox" class="company-select" data-id="${company.id}">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${company.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${company.industry}</td>
            <td class="px-6 py-4 whitespace-nowrap">${company.source}</td>
            <td class="px-6 py-4 whitespace-nowrap">${company.addedDate}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-red-600 hover:text-red-900" onclick="removeCompany(${company.id})">
                    Remove
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateCampaignsTable(filters = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`);
        let campaigns = await response.json();
        
        // Apply filters
        if (filters.status && filters.status !== 'all') {
            campaigns = campaigns.filter(c => c.status === filters.status);
        }
        if (filters.date) {
            campaigns = campaigns.filter(c => c.created.startsWith(filters.date));
        }

        const tableBody = document.getElementById('campaigns-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = campaigns.map(campaign => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${campaign.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${campaign.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${new Date(campaign.created).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${campaign.sent}</td>
                <td class="px-6 py-4 whitespace-nowrap">${campaign.opened}</td>
                <td class="px-6 py-4 whitespace-nowrap">${campaign.responded}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="text-blue-600 hover:text-blue-900 mr-2" onclick="viewCampaignDetails('${campaign._id}')">
                        View
                    </button>
                    <button class="text-red-600 hover:text-red-900" onclick="deleteCampaign('${campaign._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error updating campaigns table:', error);
        showNotification('Error updating campaigns table', 'error');
    }
}

// Modal Management
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = content;
    modal.classList.remove('hidden');
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

// Campaign Creation Modal
function showCreateCampaignModal() {
    const selectedCompanies = JSON.parse(localStorage.getItem('trackedCompanies') || '[]');
    const templates = JSON.parse(localStorage.getItem('emailTemplates') || '[]');
    
    const content = `
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Create Email Campaign</h3>
        <form id="campaign-form" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input type="text" id="campaign-name" required placeholder="Enter campaign name" class="w-full p-2 border rounded">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                <select id="template-select" class="w-full p-2 border rounded">
                    <option value="">Select a template...</option>
                    ${templates.map(template => `
                        <option value="${template.id}">${template.name}</option>
                    `).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                <textarea id="campaign-content" required class="w-full p-2 border rounded" rows="6" placeholder="Enter email content..."></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Select Companies</label>
                <div class="max-h-40 overflow-y-auto border rounded p-2">
                    ${selectedCompanies.map(company => `
                        <label class="flex items-center space-x-2 p-1 hover:bg-gray-50">
                            <input type="checkbox" value="${company.id}" class="company-checkbox">
                            <span>${company.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" onclick="hideModal()" class="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Create Campaign</button>
            </div>
        </form>
    `;
    showModal(content);

    // Add form submit handler
    document.getElementById('campaign-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createCampaign();
    });

    // Add template change handler
    document.getElementById('template-select').addEventListener('change', function(e) {
        const templateId = e.target.value;
        if (templateId) {
            const template = templates.find(t => t.id === templateId);
            if (template) {
                document.getElementById('campaign-content').value = template.content;
            }
        }
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    document.getElementById(`${pageId}-page`).classList.remove('hidden');
    
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('bg-gray-700');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('bg-gray-700');
        }
    });

    // Update relevant data when switching pages
    switch(pageId) {
        case 'fda':
            updateFDATable();
            break;
        case 'patents':
            updatePatentsTable();
            break;
        case 'fcc':
            updateFCCTable();
            break;
        case 'funding':
            updateFundingTable();
            break;
        case 'companies':
            updateCompaniesTable();
            break;
        case 'campaigns':
            updateCampaignDashboard();
            updateCampaignsTable();
            break;
    }
}

// Filter Management
function handleFilters() {
    document.getElementById('campaign-status-filter')?.addEventListener('change', function() {
        updateCampaignsTable({
            status: this.value,
            date: document.getElementById('campaign-date-filter').value
        });
    });

    document.getElementById('campaign-date-filter')?.addEventListener('change', function() {
        updateCampaignsTable({
            status: document.getElementById('campaign-status-filter').value,
            date: this.value
        });
    });
}

function resetFilters() {
    if (document.getElementById('campaign-status-filter')) {
        document.getElementById('campaign-status-filter').value = 'all';
    }
    if (document.getElementById('campaign-date-filter')) {
        document.getElementById('campaign-date-filter').value = '';
    }
    updateCampaignsTable();
}

// Campaign Dashboard
async function updateCampaignDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/campaigns`);
        const campaigns = await response.json();
        
        if (document.getElementById('total-campaigns')) {
            document.getElementById('total-campaigns').textContent = campaigns.length;
        }
        if (document.getElementById('active-campaigns')) {
            document.getElementById('active-campaigns').textContent = 
                campaigns.filter(c => c.status === 'active').length;
        }
        if (document.getElementById('total-opens')) {
            document.getElementById('total-opens').textContent = 
                campaigns.reduce((sum, c) => sum + c.opened, 0);
        }
        if (document.getElementById('total-responses')) {
            document.getElementById('total-responses').textContent = 
                campaigns.reduce((sum, c) => sum + c.responded, 0);
        }
    } catch (error) {
        console.error('Error updating campaign dashboard:', error);
        showNotification('Error updating campaign dashboard', 'error');
    }
}

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 
                    'bg-blue-500';
    
    notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function handleBulkSelections() {
    document.getElementById('select-all-companies')?.addEventListener('change', function() {
        document.querySelectorAll('.company-select').forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Navigation setup
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
        });
    });

    // Profile dropdown
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function() {
            this.querySelector('div')?.classList.toggle('hidden');
        });
    }

    // Notifications button
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', function() {
            showNotification('No new notifications', 'info');
        });
    }

    // Initialize filters
    handleFilters();

    // Initialize bulk selections
    handleBulkSelections();

    // Modal close when clicking outside
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal();
            }
        });
    }

    // Initialize dashboard
    showPage('dashboard');
});

// Export functions for module use
export {
    addToCompanies,
    removeCompany,
    createCampaign,
    showCreateCampaignModal,
    updateFDATable,
    updatePatentsTable,
    updateFCCTable,
    updateFundingTable,
    updateCompaniesTable,
    updateCampaignsTable,
    showPage,
    showModal,
    hideModal,
    showNotification
};
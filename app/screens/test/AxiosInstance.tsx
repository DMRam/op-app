// import axios from 'axios';
// import { encode } from 'base-64';

// // const axiosInstance = axios.create({
// //     baseURL: 'https://34.217.67.224:10111/grc/api/security/',
// //     timeout: 10000,
// //     httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Disable SSL verification
// //   });

// // export default axiosInstance;

// const fetchRoles = async () => {
//     try {
//         const username = 'OpenPagesAdministrator';
//         const password = 'passw0rd';
//         const token = encode(`${username}:${password}`);

//         const response = await fetch('http://localhost:3000', {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Authorization': `Basic ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Roles:', data);
//     } catch (error) {
//         console.error('Error fetching roles:', error);
//     }
// };

// fetchRoles();
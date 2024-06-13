"use server";


import axios from 'axios';

export async function requestpay(phone: string, amount:number) {
 
      const regueststatusurl = `https://ezap.co.ke/pit/pay_avia.php?Account=${phone}&Amount=${amount}`;
      
      // Set headers for the second request
      const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
    
      try {
        const response = await axios.get(regueststatusurl, { headers: requestHeaders });
  
       const responseData = response.data;
       const pResponse = JSON.stringify(responseData);
       const parsedResponse = JSON.parse(pResponse);
      // console.log("status2: "+parsedResponse);
      // console.log("status: "+parsedResponse.feedback[0].status);
       return parsedResponse.feedback[0].status;
      
      } catch (error) {
        console.error('Error:', error);
        return "error";
        // Handle error appropriately
      }

}

"use server";


import axios from 'axios';

export async function requeststkpush(phone: string, payphone:string, amount:number) {
 
      const regueststatusurl = `https://ezap.co.ke/pit/stk_push_avia.php?Account=${phone}&Payphone=${payphone}&Amount=${amount}`;
      
      // Set headers for the second request
      const requestHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
    
      try {
        const response = await axios.get(regueststatusurl, { headers: requestHeaders });
  
       const responseData = response.data;
       console.log(responseData);
       return "success";
      
      } catch (error) {
        console.error('Error:', error);
        return "error";
        // Handle error appropriately
      }

}

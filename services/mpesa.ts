import { supabase } from "./supabaseClient";

export type MpesaRequest = {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
};

export type MpesaResponse = {
  success: boolean;
  message: string;
  checkoutRequestID?: string;
  merchantRequestID?: string;
  responseCode?: string;
};

const SIMULATE = false;

const simulateMpesaPush = async (request: MpesaRequest): Promise<MpesaResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    success: true,
    message: "Success. Request accepted for processing",
    checkoutRequestID: `ws_CO_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    merchantRequestID: `${Date.now()}`,
    responseCode: "0",
  };
};

const simulateMpesaConfirmation = async (checkoutRequestID: string): Promise<MpesaResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    success: true,
    message: "The service request has been accepted successfully. The payment has been processed.",
    checkoutRequestID,
    responseCode: "0",
  };
};

export const initiateMpesaPayment = async (request: MpesaRequest): Promise<MpesaResponse> => {
  if (SIMULATE) {
    return simulateMpesaPush(request);
  }

  try {
    const { data, error } = await supabase.functions.invoke("initiate-mpesa-payment", {
      body: request,
    });
    if (error) throw error;
    return data as MpesaResponse;
  } catch (error) {
    console.error("M-Pesa payment error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initiate payment",
    };
  }
};

export const checkMpesaStatus = async (checkoutRequestID: string): Promise<MpesaResponse> => {
  if (SIMULATE) {
    return simulateMpesaConfirmation(checkoutRequestID);
  }

  try {
    const { data, error } = await supabase.functions.invoke("check-mpesa-status", {
      body: { checkoutRequestID },
    });
    if (error) throw error;
    return data as MpesaResponse;
  } catch (error) {
    console.error("M-Pesa status check error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to check payment status",
    };
  }
};

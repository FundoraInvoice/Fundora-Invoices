/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'brave' | '';

interface WalletConnectProps {
  onAccountCreated?: (username: string) => void;
  userRole?: string;
}

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  fullName: z.string().min(3, {
    message: "Full name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  imageUrl: z.string().url({
    message: "Invalid image URL.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  Cpassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.Cpassword, {
  message: "Passwords do not match",
  path: ["Cpassword"],
});

const WalletConnect = ({ onAccountCreated, userRole = "sme" }: WalletConnectProps) => {
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('');
  const [step, setStep] = useState<'credentials' | 'wallet'>('credentials');
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      imageUrl: "",
      password: "",
      Cpassword: "",
    },
  });

  const onSubmitCredentials = (data: z.infer<typeof formSchema>) => {
    setUsername(data.username);
    toast({
      title: "Account details saved",
      description: `Username: ${data.username}`,
    });
    setStep('wallet');
  };

  const detectWallet = (): { available: WalletType[], default: WalletType } => {
    const available: WalletType[] = [];
    let defaultWallet: WalletType = '';

    if (typeof window !== 'undefined') {
      const ethereum = (window as any).ethereum;

      if (ethereum) {
        if (ethereum.isMetaMask) {
          available.push('metamask');
          defaultWallet = 'metamask';
        }
        if (ethereum.isBraveWallet) {
          available.push('brave');
          if (!defaultWallet) defaultWallet = 'brave';
        }
        if (ethereum.isCoinbaseWallet) {
          available.push('coinbase');
          if (!defaultWallet) defaultWallet = 'coinbase';
        }
      }

      available.push('walletconnect');
    }

    return { available, default: defaultWallet };
  };

  const connectWallet = async (walletType: WalletType) => {
    setSelectedWallet(walletType);
    setConnecting(true);

    try {
      let address = "";

      if (walletType === 'metamask') {
        const { ethereum } = window as any;
        if (!ethereum || !ethereum.isMetaMask) {
          throw new Error("MetaMask not available");
        }

        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        address = accounts[0];
        setWalletAddress(address);
      }

      // Save user data including new fields
      const userData = {
        username,
        isLoggedIn: true,
        role: userRole,
        accountType: userRole === "sme" ? "SME" : "Investor",
        walletType,
        walletAddress: address,
        fullName: form.getValues("fullName"),
        email: form.getValues("email"),
        imageUrl: form.getValues("imageUrl"),
      };

      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: "Account Connected",
        description: `Connected to ${walletType}: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });

      if (onAccountCreated && username) {
        onAccountCreated(username);
      }

    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Could not connect to wallet.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const { available } = detectWallet();

  const MetaMaskLogo = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 318.6 318.6">
      <polygon fill="#E2761B" points="274.1,35.5 174.5,111.1 193.5,66.2" />
      <polygon fill="#E4761B" points="44.4,35.5 123.9,66.4 142.2,111.3" />
      <polygon fill="#D7C1B3" points="238.9,228.7 206.5,252.2 230.4,273.2 268.2,274.3" />
      <polygon fill="#D7C1B3" points="79.1,228.7 50.4,274.3 88.2,273.2 112.1,252.2" />
      <polygon fill="#EA8D3A" points="135.1,196.1 129.1,213.8 181.3,213.8 175.1,196" />
      <polygon fill="#C0AD9E" points="112.1,252.2 136.9,238.5 138.9,223.2 112.1,228.7" />
      <polygon fill="#C0AD9E" points="206.5,252.2 205.3,228.7 178.4,223.2 180.6,238.5" />
      <polygon fill="#763D16" points="180.6,238.5 178.4,223.2 181.3,213.8 129.1,213.8 132,223.2 129.9,238.5 112.1,252.2 136.9,238.5 138.9,223.2 180.6,238.5" />
      <polygon fill="#F6851B" points="177.1,142.6 196.2,175.8 218.1,178.4 224.2,138.2" />
      <polygon fill="#F6851B" points="141.5,142.6 94.4,138.2 100.5,178.4 122.4,175.8" />
      <polygon fill="#763D16" points="88.2,273.2 136.9,238.5 129.9,238.5 112.1,252.2" />
      <polygon fill="#763D16" points="230.4,273.2 180.6,238.5 187.6,238.5 206.5,252.2" />
    </svg>
  );

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: MetaMaskLogo,
      description: 'Connect using browser extension',
      disabled: !available.includes('metamask')
    }
  ];

  return (
    <div className="py-4">
      {step === 'credentials' ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitCredentials)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (.base.eth)</FormLabel>
                  <FormControl>
                    <Input placeholder="username.base.eth" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Image</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            field.onChange(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Cpassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <Button type="submit" className="w-full bg-gradient-to-r from-fundora-blue to-fundora-cyan */}

            <Button type="submit" className="w-full bg-gradient-to-r from-fundora-blue to-fundora-cyan text-white">
              Next: Connect Wallet
            </Button>
          </form>
        </Form>
      ) : (
        <>
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                disabled={connecting || wallet.disabled}
                className={`w-full justify-start gap-3 py-6 glass-morphism border border-white/10 ${
                  selectedWallet === wallet.id ? 'border-fundora-cyan' : 'hover:border-fundora-blue/50'
                }`}
                onClick={() => connectWallet(wallet.id as WalletType)}
              >
                {wallet.icon}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{wallet.name}</span>
                  <span className="text-xs text-gray-400">{wallet.description}</span>
                </div>
                {wallet.disabled && (
                  <span className="ml-auto text-xs text-gray-500">Not detected</span>
                )}
                {connecting && selectedWallet === wallet.id && (
                  <span className="ml-auto">
                    <svg className="animate-spin h-5 w-5 text-fundora-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
              </Button>
            ))}
          </div>

          <p className="mt-6 text-sm text-center text-gray-400">
            By connecting a wallet, you agree to Fundora's Terms of Service and Privacy Policy
          </p>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
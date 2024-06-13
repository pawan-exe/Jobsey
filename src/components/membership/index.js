"use client";

import { membershipPlans } from "@/utils";
import CommonCard from "../common-card";
import JobIcon from "../job-icon";
import { Button } from "../ui/button";
import {
  createPriceIdAction,
  createStripePaymentAction,
  updateProfileAction,
} from "@/actions";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const stripePromise = loadStripe(
  "pk_test_51PQq37P85SOipBLV1IcCBBfbLwVPNh5DMI9OSuVyToehRS4eSxjZFRHm9mnMMmnzbe2Q3KLapFTJiT4BebdvGjMc00iNQfHe8k"
);

function Membership({ profileInfo }) {
  const pathName = useSearchParams();

  async function handlePayment(getCurrentPlan) {
    const stripe = await stripePromise;
    const extractPriceId = await createPriceIdAction({
      amount: Number(getCurrentPlan?.price),
    });

    if (extractPriceId) {
      sessionStorage.setItem("currentPlan", JSON.stringify(getCurrentPlan));
      const result = await createStripePaymentAction({
        lineItems: [
          {
            price: extractPriceId?.id,
            quantity: 1,
          },
        ],
      });

      await stripe.redirectToCheckout({
        sessionId: result?.id,
      });
    }
  }

  async function updateProfile() {
    const fetchCurrentPlanFromSessionStroage = JSON.parse(
      sessionStorage.getItem("currentPlan")
    );

    await updateProfileAction(
      {
        ...profileInfo,
        isPremiumUser: true,
        memberShipType: fetchCurrentPlanFromSessionStroage?.type,
        memberShipStartDate: new Date().toString(),
        memberShipEndDate: new Date(
          new Date().getFullYear() +
            fetchCurrentPlanFromSessionStroage?.type ===
          "basic"
            ? 1
            : fetchCurrentPlanFromSessionStroage?.plan === "teams"
            ? 2
            : 5,
          new Date().getMonth(),
          new Date().getDay()
        ),
      },
      "/membership"
    );
  }

  useEffect(() => {
    if (pathName.get("status") === "success") updateProfile();
  }, [pathName]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-baseline dark:border-white justify-between border-b pb-6 pt-24">
        <h1 className="text-4xl dark:text-white font-bold tracking-tight text-gray-950">
          {profileInfo?.isPremiumUser
            ? "You are a Premium User"
            : "Choose your Best Plan"}
        </h1>
        <div>
          {profileInfo?.isPremiumUser ? (
            <Button className="disabled:opacity-65 flex items-center justify-center ">
              {
                membershipPlans.find(
                  (planItem) => planItem.type === profileInfo?.memberShipType
                ).heading
              }
            </Button>
          ) : null}
        </div>
      </div>

      <div className="py-20 pb-24 pt-6">
        <div className="container mx-auto p-0 space-y-8">
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {membershipPlans.map((plan, index) => (
              <CommonCard
                icon={
                  <div className="flex justify-between">
                    <div>
                      <JobIcon />
                    </div>
                    <h1 className="font-bold dark:text-black text-2xl">
                      {plan.heading}
                    </h1>
                  </div>
                }
                title={`₹ ${plan.price} /yr`}
                description={plan.type}
                footerContent={
                  profileInfo?.memberShipType === "enterprise" ||
                  (profileInfo?.memberShipType === "basic" && index === 0) ||
                  (profileInfo?.memberShipType === "teams" &&
                  index >= 0 &&
                  index < 2 ? null : (
                    <Button
                      onClick={() => handlePayment(plan)}
                      className="disabled:opacity-65 dark:bg-[#F1EC0D] flex h-11 items-center justify-center px-5"
                    >
                      {profileInfo?.memberShipType === "basic" ||
                      profileInfo?.memberShipType === "teams"
                        ? "Update Plan"
                        : "Get Premium"}
                    </Button>
                  ))
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Membership;

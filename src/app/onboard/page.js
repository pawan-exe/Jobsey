import { fetchProfileAction } from "@/actions";
import OnBoard from "@/components/on-board";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function OnBoardPage() {
  // get the auth user from the clerk
  const user = await currentUser();

  // fecth the profile info

  const profileInfo = await fetchProfileAction(user?.id);

  if (profileInfo?._id) {
    if (profileInfo?.role === "recruiter" && !profileInfo.isPremiumUser) {
      redirect("/membership");
    } else {
      redirect("/");
    }
  } else {
    return <OnBoard />;
  }
}

export default OnBoardPage;

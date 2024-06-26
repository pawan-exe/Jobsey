"use client";

import { Fragment, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import CommonCard from "../common-card";
import JobIcon from "../job-icon";
import { Button } from "../ui/button";
import { createJobApplicationAction } from "@/actions";
import { useToast } from "../ui/use-toast";

function CandidateJobCard({ jobItem, profileInfo, jobApplications }) {
  const [showJobDetailsDrawer, setShowJobDetailsDrawer] = useState(false);
  const { toast } = useToast();

  async function handleJobApply() {
    if (!profileInfo?.isPremiumUser && jobApplications.length >= 2) {
      setShowJobDetailsDrawer(false);
      toast({
        variant: "destructive",
        title: "You can apply max 2 jobs",
        description: "Please opt for membership to apply more jobs",
      });
      return;
    } else if (
      profileInfo?.isPremiumUser &&
      profileInfo?.memberShipType === "basic" &&
      jobApplications.length >= 5
    ) {
      setShowJobDetailsDrawer(false);
      toast({
        variant: "destructive",
        title: "You can apply max 5 jobs",
        description: "Please update your plan to apply more jobs",
      });
      return;
    } else if (
      profileInfo?.isPremiumUser &&
      profileInfo?.memberShipType === "teams" &&
      jobApplications.length >= 10
    ) {
      setShowJobDetailsDrawer(false);
      toast({
        variant: "destructive",
        title: "You can apply max 10 jobs",
        description: "Please update your plan to apply more jobs",
      });
      return;
    }
    await createJobApplicationAction(
      {
        recruiterUserID: jobItem?.recruiterId,
        name: profileInfo?.candidateInfo?.name,
        email: profileInfo?.email,
        candidateUserID: profileInfo?.userId,
        status: ["Applied"],
        jobID: jobItem?._id,
        jobAppliedDate: new Date().toLocaleDateString(),
      },
      "/jobs"
    );
    setShowJobDetailsDrawer(false);
    toast({
      variant: "success",
      title: "Application submitted!",
      description: "We will review your information and get back to you soon.",
      className: "bg-green-500 text-white",
      duration: 3000,
    });
  }

  return (
    <Fragment>
      <Drawer
        open={showJobDetailsDrawer}
        onOpenChange={setShowJobDetailsDrawer}
      >
        <CommonCard
          icon={<JobIcon />}
          title={jobItem?.title}
          description={jobItem?.companyName}
          footerContent={
            <Button
              onClick={() => setShowJobDetailsDrawer(true)}
              className="flex dark:bg-[#F1EC0D] h-11 items-center justify-center px-5"
            >
              View Details
            </Button>
          }
        />
        <DrawerContent className="p-6">
          <DrawerHeader className="px-0">
            <div className="flex flex-wrap gap-3 justify-between">
              <DrawerTitle className=" text-3xl md:text-4xl whitespace-nowrap dark:text-white font-extrabold text-gray-800">
                {jobItem?.title}
              </DrawerTitle>
              <div className="flex gap-3">
                <Button
                  onClick={handleJobApply}
                  disabled={
                    jobApplications.findIndex(
                      (item) => item.jobID === jobItem?._id
                    ) > -1
                      ? true
                      : false
                  }
                  className=" disabled:opacity-65 flex h-11 items-center justify-center px-5"
                >
                  {jobApplications.findIndex(
                    (item) => item.jobID === jobItem?._id
                  ) > -1
                    ? "Applied"
                    : "Apply"}
                </Button>
                <Button
                  className="flex h-11 items-center justify-center px-5"
                  onClick={() => setShowJobDetailsDrawer(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DrawerHeader>
          <DrawerDescription className="text-2xl dark:text-white font-medium text-gray-600">
            {jobItem?.description}
            <span className="text-xl dark:text-white ml-4 font-normal text-gray-500">
              - {jobItem?.location}
            </span>
          </DrawerDescription>
          <div className="w-[150px] mt-6 flex justify-center items-center h-[40px] dark:bg-white bg-black rounded-[4px]">
            <h2 className="text-xl font-bold text-white dark:text-black">
              {jobItem?.type}
            </h2>
          </div>
          <h3 className="text-2xl dark:text-white font-medium text-gray-800 mt-3">
            Experience: {jobItem?.experience} year
          </h3>
          <div className="flex flex-wrap gap-4 mt-6 ">
            {jobItem?.skills.split(",").map((skillItem) => (
              <div className="w-[100px] flex justify-center items-center h-[25px] dark:bg-white bg-[#653822] rounded-2xl">
                <h2 className="text-[13px] font-medium  text-white dark:text-black">
                  {skillItem}
                </h2>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </Fragment>
  );
}

export default CandidateJobCard;

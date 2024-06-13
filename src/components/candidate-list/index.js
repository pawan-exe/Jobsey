"use client";

import { Fragment } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import {
  getCandidateDetailsIDAction,
  updateJobApplicationAction,
} from "@/actions";

import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://ugwibbbiznuwigihclul.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd2liYmJpem51d2lnaWhjbHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5OTkwNzAsImV4cCI6MjAzMzU3NTA3MH0.dd0MWbIWHYUWBk1_Bz45SSoTpQSxfdAtaS-d8Ourhz4"
);

function CandidateList({
  jobApplications,
  currentCandidateDetails,
  setCurrentCandidateDetails,
  showCurrentCandidateDetailsModal,
  setShowCurrentCandidateDetailsModal,
}) {
  async function handleFetchCandidateDetails(getCurrentCandidateId) {
    const data = await getCandidateDetailsIDAction(getCurrentCandidateId);

    if (data) {
      setCurrentCandidateDetails(data);
      setShowCurrentCandidateDetailsModal(true);
    }
  }

  function handlePreviewResume() {
    const { data } = supabaseClient.storage
      .from("jobsey")
      .getPublicUrl(currentCandidateDetails?.candidateInfo?.resume);

    const a = document.createElement("a");
    a.href = data?.publicUrl;
    a.setAttribute("download", "Resume.pdf");
    a.setAttribute("target", "_blank");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleUpdateJobStatus(getCurrentStatus) {
    let cpyJobApplicants = [...jobApplications];
    const indexOfCurrentJobApplicant = cpyJobApplicants.findIndex(
      (item) => item.candidateUserID === currentCandidateDetails?.userId
    );
    const jobApplicantsToUpdate = {
      ...cpyJobApplicants[indexOfCurrentJobApplicant],
      status:
        cpyJobApplicants[indexOfCurrentJobApplicant].status.concat(
          getCurrentStatus
        ),
    };

    await updateJobApplicationAction(jobApplicantsToUpdate, "/jobs");
  }

  return (
    <Fragment>
      <div className="grid grid-cols-1 gap-3 p-10 md:grid-cols-2 lg:grid-cols-3">
        {jobApplications && jobApplications.length > 0
          ? jobApplications.map((jobApplicantItem) => (
              <div className="bg-white shadow-lg w-full max-w-sm rounded-lg overflow-hidden mx-auto mt-4">
                <div className="px-4 my-6 flex justify-between items-center">
                  <h3 className="text-lg font-bold dark:text-black">
                    {jobApplicantItem?.name}
                  </h3>
                  <Button
                    onClick={() =>
                      handleFetchCandidateDetails(
                        jobApplicantItem?.candidateUserID
                      )
                    }
                    className="dark:bg-[#fffa27]  flex h-11 items-center justify-center px-5"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))
          : null}
      </div>
      <Dialog
        open={showCurrentCandidateDetailsModal}
        onOpenChange={() => {
          setCurrentCandidateDetails(null);
          setShowCurrentCandidateDetailsModal(false);
        }}
      >
        <DialogContent>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-black">
              {currentCandidateDetails?.candidateInfo?.name},{" "}
              {currentCandidateDetails?.email}
            </h1>
            <p className="text-xl font-medium dark:text-white text-black">
              {currentCandidateDetails?.candidateInfo?.currentCompany}
            </p>
            <p className="text-sm font-normal dark:text-white text-black">
              {currentCandidateDetails?.candidateInfo?.currentJobLocation}
            </p>
            <p className="dark:text-white">
              Total Experience:{" "}
              {currentCandidateDetails?.candidateInfo?.totalExperience} Years
            </p>
            <p className="dark:text-white">
              Salary: {currentCandidateDetails?.candidateInfo?.currentSalary}{" "}
              LPA
            </p>
            <p className="dark:text-white">
              Notice Period:{" "}
              {currentCandidateDetails?.candidateInfo?.noticePeriod} Days
            </p>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <h1 className="dark:text-white ">Previous Companies:</h1>
                {currentCandidateDetails?.candidateInfo?.previousCompanies
                  .split(",")
                  .map((skillItem) => (
                    <div className="w-[100px] dark:bg-white flex justify-center items-center h-[35px] bg-black rounded-[4px]">
                      <h2 className="text-[13px]  dark:text-black font-medium text-white">
                        {skillItem}
                      </h2>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-3 mt-6">
              <h1 className="dark:text-white ">Skills:</h1>
              {currentCandidateDetails?.candidateInfo?.skills
                .split(",")
                .map((skillItem) => (
                  <div className="w-[100px] dark:bg-white flex justify-center items-center h-[25px] bg-[#653822] rounded-2xl">
                    <h2 className="text-[13px] dark:text-black font-medium text-white">
                      {skillItem}
                    </h2>
                  </div>
                ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handlePreviewResume}
              className=" flex h-11 items-center justify-center px-5 bg-sky-800 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Resume
            </Button>
            <div className="flex flex-wrap-reverse gap-3">
              <Button
                onClick={() => handleUpdateJobStatus("selected")}
                className=" disabled:opacity-65 flex h-11 items-center justify-center px-5"
                disabled={
                  jobApplications
                    .find(
                      (item) =>
                        item.candidateUserID === currentCandidateDetails?.userId
                    )
                    ?.status.includes("selected") ||
                  jobApplications
                    .find(
                      (item) =>
                        item.candidateUserID === currentCandidateDetails?.userId
                    )
                    ?.status.includes("rejected")
                    ? true
                    : false
                }
              >
                {jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("selected")
                  ? "Selected"
                  : "Select"}
              </Button>
              <Button
                onClick={() => handleUpdateJobStatus("rejected")}
                className=" disabled:opacity-65 flex h-11 items-center justify-center px-5"
                disabled={
                  jobApplications
                    .find(
                      (item) =>
                        item.candidateUserID === currentCandidateDetails?.userId
                    )
                    ?.status.includes("selected") ||
                  jobApplications
                    .find(
                      (item) =>
                        item.candidateUserID === currentCandidateDetails?.userId
                    )
                    ?.status.includes("rejected")
                    ? true
                    : false
                }
              >
                {jobApplications
                  .find(
                    (item) =>
                      item.candidateUserID === currentCandidateDetails?.userId
                  )
                  ?.status.includes("rejected")
                  ? "Rejected"
                  : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}

export default CandidateList;

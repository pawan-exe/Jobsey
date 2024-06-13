"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import CommonForm from "../common-form";
import {
  candidateOnboardFormControls,
  initialCandidateFormData,
  initialRecruiterFormData,
  recruiterOnboardFormControls,
} from "@/utils";
import { useUser } from "@clerk/nextjs";
import { createProfileAction } from "@/actions";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://ugwibbbiznuwigihclul.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd2liYmJpem51d2lnaWhjbHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5OTkwNzAsImV4cCI6MjAzMzU3NTA3MH0.dd0MWbIWHYUWBk1_Bz45SSoTpQSxfdAtaS-d8Ourhz4"
);

function OnBoard() {
  const [currentTab, setCurrentTab] = useState("candidate");

  const [recruiterFormData, setRecruiterFormData] = useState(
    initialRecruiterFormData
  );

  const [candidateFormData, setCandidateFormData] = useState(
    initialCandidateFormData
  );

  const [file, setFile] = useState(null);

  const currentAuthUser = useUser();
  const { user } = currentAuthUser;

  function handleTabChange(value) {
    setCurrentTab(value);
  }

  function handleFileChange(event) {
    event.preventDefault();
    setFile(event.target.files[0]);
  }

  async function handleUploadPdfToSupabase() {
    const { data, error } = await supabaseClient.storage
      .from("jobsey")
      .upload(`/public/${file.name}`, file, {
        cacheControl: "3600",
        upsert: false,
      });
    console.log(data, error);
    if (data) {
      setCandidateFormData({
        ...candidateFormData,
        resume: data.path,
      });
    }
  }

  useEffect(() => {
    if (file) handleUploadPdfToSupabase();
  }, [file]);

  function handleRecruiterFormValid() {
    return (
      recruiterFormData &&
      recruiterFormData.name.trim() !== "" &&
      recruiterFormData.companyName.trim() !== "" &&
      recruiterFormData.companyRole.trim() !== ""
    );
  }

  function handleCandidateFormValid() {
    return Object.keys(candidateFormData).every(
      (key) => candidateFormData[key].trim() !== ""
    );
  }

  async function createProfile() {
    const data =
      currentTab === "candidate"
        ? {
            candidateInfo: candidateFormData,
            role: "candidate",
            isPremiumUser: false,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
            profilePic: user?.imageUrl,
          }
        : {
            recruiterInfo: recruiterFormData,
            role: "recruiter",
            isPremiumUser: false,
            userId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
            profilePic: user?.imageUrl,
          };
    await createProfileAction(data, "/onboard");
  }

  return (
    <div className="bg-white">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <div className="w-full">
          <div className="flex items-baseline justify-between border-b pb-6 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Welcome to onboarding
            </h1>
            <TabsList>
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value="candidate">
          <CommonForm
            formControls={candidateOnboardFormControls}
            buttonText={"Onboard as candidate"}
            formData={candidateFormData}
            setFormData={setCandidateFormData}
            isBtnDisabled={!handleCandidateFormValid()}
            handleFileChange={handleFileChange}
            action={createProfile}
          />
        </TabsContent>
        <TabsContent value="recruiter">
          <CommonForm
            formControls={recruiterOnboardFormControls}
            buttonText={"Onboard as recruiter"}
            formData={recruiterFormData}
            setFormData={setRecruiterFormData}
            isBtnDisabled={!handleRecruiterFormValid()}
            action={createProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OnBoard;

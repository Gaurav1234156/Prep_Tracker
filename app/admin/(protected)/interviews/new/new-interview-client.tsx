"use client";

import { createFullInterview } from "@/app/_actions/interview";
import { InterviewWizard } from "@/components/forms/wizard/WizardShell";
import type {
  CompanyOption,
  RoleLevelOption,
  TopicAreaOption,
  SubTopicOption,
  WizardValues,
} from "@/components/forms/wizard/types";

export function NewInterviewClient({
  companies,
  topicAreas,
  subTopics,
  roleLevels,
}: {
  companies: CompanyOption[];
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
  roleLevels: RoleLevelOption[];
}) {
  return (
    <InterviewWizard
      mode="create"
      companies={companies}
      topicAreas={topicAreas}
      subTopics={subTopics}
      roleLevels={roleLevels}
      cancelHref="/admin/interviews"
      onSubmit={async (values: WizardValues) => createFullInterview(values)}
    />
  );
}

"use client";

import { updateFullInterview } from "@/app/_actions/interview";
import { InterviewWizard } from "@/components/forms/wizard/WizardShell";
import type {
  CompanyOption,
  RoleLevelOption,
  TopicAreaOption,
  SubTopicOption,
  WizardValues,
} from "@/components/forms/wizard/types";

export function EditInterviewClient({
  id,
  companies,
  topicAreas,
  subTopics,
  roleLevels,
  initialValues,
}: {
  id: string;
  companies: CompanyOption[];
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
  roleLevels: RoleLevelOption[];
  initialValues: WizardValues;
}) {
  return (
    <InterviewWizard
      mode="edit"
      companies={companies}
      topicAreas={topicAreas}
      subTopics={subTopics}
      roleLevels={roleLevels}
      initialValues={initialValues}
      cancelHref={`/admin/interviews/${id}`}
      onSubmit={async (values: WizardValues) => updateFullInterview(id, values)}
    />
  );
}

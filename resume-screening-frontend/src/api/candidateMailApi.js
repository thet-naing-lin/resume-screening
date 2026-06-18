import api from "./axios";

export const getMailTemplate = (type, candidateName, jobTitle) =>
  api.get("/candidates/mail-template", {
    params: { type, candidate_name: candidateName, job_title: jobTitle },
  });

export const sendCandidateMail = (data) =>
  api.post("/candidates/send-mail", data);

export const sendBulkMail = (data) =>
  api.post("/candidates/mail/send-bulk", data);

export const getBulkPreview = (params) =>
  api.get("/candidates/mail/bulk-preview", { params });

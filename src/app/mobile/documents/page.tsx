"use client";

import React, { useEffect, useState } from "react";
import { FileCheck, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function MobileDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [verifyStatus, setVerifyStatus] = useState<"VERIFIED" | "REJECTED">("VERIFIED");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: verifyStatus, remarks }),
      });

      if (res.ok) {
        setVerifyModalOpen(false);
        fetchDocs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Documents Verification</h1>
        <p className="text-[11px] text-slate-500">Approve or reject customer KYC</p>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading...</div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{doc.lead?.name}</h3>
                  <div className="text-[11px] font-mono text-slate-500">{doc.docType} • {doc.fileName}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    doc.status === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-700"
                      : doc.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              {doc.remarks && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded">
                  Note: {doc.remarks}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1 border-t">
                {doc.status === "PENDING" ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setVerifyStatus("VERIFIED");
                        setRemarks("Document verified");
                        setVerifyModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium text-[11px]"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setVerifyStatus("REJECTED");
                        setRemarks("Document rejected: invalid");
                        setVerifyModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium text-[11px]"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDoc(doc);
                      setVerifyStatus(doc.status === "VERIFIED" ? "REJECTED" : "VERIFIED");
                      setRemarks("Status updated");
                      setVerifyModalOpen(true);
                    }}
                    className="text-xs text-indigo-600 underline"
                  >
                    Change Status
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {verifyModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-5 text-xs">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-bold text-slate-900 text-sm">
                {verifyStatus === "VERIFIED" ? "Verify Document" : "Reject Document"}
              </h3>
              <button onClick={() => setVerifyModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleVerify} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-3 py-1.5 text-white rounded-lg font-medium ${
                    verifyStatus === "VERIFIED" ? "bg-emerald-600" : "bg-rose-600"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

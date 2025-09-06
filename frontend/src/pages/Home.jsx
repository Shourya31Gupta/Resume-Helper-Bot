import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Spacing, LevelFormat } from "docx";

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload a resume first");

    setLoading(true);
    setResult(""); 

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        
        const response = await axios.post("/api/upload", {
          file: base64String,
          fileName: file.name
        });
        
        setResult(response.data.summary);
        setResume(response.data.resume);
        setLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading:", err);
      alert("Failed to analyze the resume. Please try again.");
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult("");
    setResume("");
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          AI-Powered Resume Tools
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Analyze and improve existing resumes or create professional resumes from scratch using advanced AI technology
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link 
            to="/create"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover-lift shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Resume
          </Link>
        </div>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 file-upload-area ${
              dragActive
                ? "drag-active"
                : "hover:border-slate-400"
            } ${file ? "border-green-500 bg-green-50" : "border-slate-300"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200 ${
                file ? "bg-green-100" : "bg-slate-100"
              }`}>
                {file ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              
              <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-slate-900">
                    {file ? file.name : "Upload your resume"}
                  </span>
                  <p className="text-sm text-slate-500 mt-1">
                    {file ? "Click to change file" : "Drag and drop or click to browse"}
                  </p>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  name="resume"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="sr-only"
                  required
                />
              </div>

              {/* File info display */}
              {file && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 hover-lift ${
              loading || !file
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Resume...</span>
              </div>
            ) : (
              "Analyze Resume"
            )}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover-lift">
            <div className="flex items-center justify-center space-x-3 text-blue-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">AI is analyzing your resume...</span>
            </div>
            <p className="text-slate-600 mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && resume && !loading && (
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up">
          {/* AI Summary & Tips */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">AI Analysis & Tips</h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>

          {/* Improved Resume */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover-lift">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Improved Resume</h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {resume}
              </ReactMarkdown>
            </div>
            
                         {/* Download Button */}
             <div className="mt-6 pt-4 border-t border-slate-200">
               <button
                                   onClick={async () => {
                    try {
                      // Function to convert markdown to Word document with formatting
                      const convertMarkdownToWord = (markdown) => {
                        const lines = markdown.split('\n');
                        const paragraphs = [];
                        
                        // Add title
                        paragraphs.push(
                          new Paragraph({
                            text: "Improved Resume",
                            heading: HeadingLevel.HEADING_1,
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              after: 400,
                              before: 200,
                            },
                          })
                        );
                        
                        // Add spacing after title
                        paragraphs.push(
                          new Paragraph({
                            children: [new TextRun({ text: "", break: 1 })],
                            spacing: { after: 200 },
                          })
                        );
                        
                        lines.forEach((line, index) => {
                          const trimmedLine = line.trim();
                          
                          if (trimmedLine === '') {
                            // Empty line - add spacing
                            paragraphs.push(
                              new Paragraph({
                                children: [new TextRun({ text: "", break: 1 })],
                                spacing: { after: 200 },
                              })
                            );
                          } else if (trimmedLine.startsWith('#')) {
                            // Heading
                            const level = trimmedLine.match(/^#+/)[0].length;
                            const text = trimmedLine.replace(/^#+\s*/, '');
                            
                            let headingLevel;
                            switch (level) {
                              case 1: headingLevel = HeadingLevel.HEADING_1; break;
                              case 2: headingLevel = HeadingLevel.HEADING_2; break;
                              case 3: headingLevel = HeadingLevel.HEADING_3; break;
                              default: headingLevel = HeadingLevel.HEADING_4;
                            }
                            
                            paragraphs.push(
                              new Paragraph({
                                text: text,
                                heading: headingLevel,
                                spacing: { after: 200, before: 300 },
                              })
                            );
                          } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                            // Bullet point
                            const text = trimmedLine.replace(/^[-*]\s*/, '');
                            paragraphs.push(
                              new Paragraph({
                                text: text,
                                bullet: {
                                  level: 0,
                                },
                                spacing: { after: 100 },
                              })
                            );
                          } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                            // Bold text
                            const text = trimmedLine.replace(/\*\*/g, '');
                            paragraphs.push(
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: text,
                                    bold: true,
                                    size: 24,
                                  }),
                                ],
                                spacing: { after: 200 },
                              })
                            );
                          } else if (trimmedLine.includes('**')) {
                            // Mixed bold and regular text
                            const parts = trimmedLine.split(/(\*\*.*?\*\*)/);
                            const children = parts.map(part => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return new TextRun({
                                  text: part.replace(/\*\*/g, ''),
                                  bold: true,
                                  size: 24,
                                });
                              } else if (part.trim()) {
                                return new TextRun({
                                  text: part,
                                  size: 24,
                                });
                              }
                              return null;
                            }).filter(Boolean);
                            
                            if (children.length > 0) {
                              paragraphs.push(
                                new Paragraph({
                                  children: children,
                                  spacing: { after: 200 },
                                })
                              );
                            }
                          } else {
                            // Regular paragraph
                            paragraphs.push(
                              new Paragraph({
                                text: trimmedLine,
                                spacing: { after: 200 },
                              })
                            );
                          }
                        });
                        
                        return paragraphs;
                      };
                      
                      // Create Word document with formatting
                      const doc = new Document({
                        sections: [{
                          properties: {},
                          children: convertMarkdownToWord(resume),
                        }],
                      });
                      
                      // Generate and download the document
                      const blob = await Packer.toBlob(doc);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'improved-resume.docx';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error generating Word document:', error);
                      alert('Failed to generate Word document. Please try again.');
                    }
                  }}
                 className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 hover-lift shadow-lg flex items-center justify-center space-x-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <span>Download Improved Resume (Word)</span>
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Why Choose Our AI Resume Tools?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Instant Analysis</h3>
            <p className="text-slate-600 text-sm">Get comprehensive feedback in seconds using advanced AI</p>
          </div>
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Create Resume</h3>
            <p className="text-slate-600 text-sm">Build professional resumes from scratch with AI assistance</p>
          </div>
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Professional Tips</h3>
            <p className="text-slate-600 text-sm">Actionable advice to make your resume stand out</p>
          </div>
          <div className="text-center space-y-3 hover-lift p-4 rounded-lg transition-all duration-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900">Easy Download</h3>
            <p className="text-slate-600 text-sm">Download as Word document ready for applications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

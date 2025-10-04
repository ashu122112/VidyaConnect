import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VideoCameraIcon, UploadIcon, PollIcon, DownloadIcon } from '../components/Icons';

const DashboardPage = () => {
  const navigate = useNavigate();

  // 🔹 Dummy logged-in user (change role to 'STUDENT' or 'TEACHER' to test)
  const [user, setUser] = useState({
    email: 'teacher1@mnnit.ac.in',
    role: 'TEACHER', // or 'STUDENT'
  });

  // 🔹 Dummy sessions
  const [sessions, setSessions] = useState([
    { id: 1, title: 'Maths Lecture 1', teacherName: 'teacher1@mnnit.ac.in' },
    { id: 2, title: 'Physics Discussion', teacherName: 'teacher2@mnnit.ac.in' },
    { id: 3, title: 'Chemistry Lab', teacherName: 'teacher1@mnnit.ac.in' },
  ]);

  // 🔹 Dummy materials
  const [materials, setMaterials] = useState({
    1: [
      { id: 'pdf-1', name: 'Maths_Notes.pdf', url: '#' },
      { id: 'vid-1', name: 'Lecture_Recording.mp4', url: '#' },
    ],
    2: [{ id: 'pdf-2', name: 'Physics_Formula_Sheet.pdf', url: '#' }],
    3: [],
  });

  // 🔹 State for teacher actions
  const [sessionTitle, setSessionTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploadingSessionId, setUploadingSessionId] = useState('');

  // Simulated logout
  const logout = () => {
    alert('Logged out (simulated)');
    setUser(null);
  };

  // Simulated create session
  const handleCreateSession = (e) => {
    e.preventDefault();
    const newSession = {
      id: Date.now(),
      title: sessionTitle,
      teacherName: user.email,
    };
    setSessions((prev) => [...prev, newSession]);
    alert(`Session "${sessionTitle}" created successfully (simulated)!`);
    setSessionTitle('');
  };

  // Simulated upload
  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!file || !uploadingSessionId) {
      alert('Please select a file and a session.');
      return;
    }

    const newMaterial = {
      id: Date.now(),
      name: file.name,
      url: '#',
    };

    setMaterials((prev) => ({
      ...prev,
      [uploadingSessionId]: [...(prev[uploadingSessionId] || []), newMaterial],
    }));

    alert(`File "${file.name}" uploaded successfully (simulated)!`);
    setFile(null);
    e.target.reset();
  };

  // 🧑‍🏫 Teacher Dashboard
  const TeacherDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Create Session */}
      <div>
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <VideoCameraIcon />
            <span className="ml-2">Create Session</span>
          </h2>
          <form onSubmit={handleCreateSession} className="mt-4 flex space-x-2">
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Session Title"
              required
              className="flex-grow px-3 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="px-6 py-2 text-white bg-green-500 rounded-md"
            >
              Start
            </button>
          </form>
        </div>

        {/* Upload Content */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <UploadIcon />
            <span className="ml-2">Upload Content</span>
          </h2>
          <form onSubmit={handleFileUpload} className="mt-4 space-y-4">
            <select
              onChange={(e) => setUploadingSessionId(e.target.value)}
              defaultValue=""
              required
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="" disabled>
                -- Choose a session --
              </option>
              {sessions
                .filter((s) => s.teacherName === user.email)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
            </select>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full"
            />
            <button
              type="submit"
              className="w-full px-6 py-2 text-white bg-blue-600 rounded-md"
            >
              Upload
            </button>
          </form>
        </div>
      </div>

      {/* Create Poll */}
      <div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <PollIcon />
            <span className="ml-2">Create Poll</span>
          </h2>
          <div className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="Poll Question"
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Option 1"
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Option 2"
              className="w-full px-3 py-2 border rounded-md"
            />
            <button className="w-full px-6 py-2 text-gray-700 bg-gray-200 rounded-md">
              Save Poll
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 👨‍🎓 Student Dashboard
  const StudentDashboard = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Active Sessions</h2>
      {sessions.length > 0 ? (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="p-4 bg-gray-50 rounded-lg border shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{session.title}</p>
                  <p className="text-sm text-gray-600">
                    Teacher: {session.teacherName}
                  </p>
                </div>
                <Link
                  to={`/session/${session.id}`}
                  className="px-6 py-2 text-white bg-blue-600 rounded-md"
                >
                  Join
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-sm flex items-center">
                  <DownloadIcon /> <span className="ml-1">Materials</span>
                </h4>
                {materials[session.id] && materials[session.id].length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {materials[session.id].map((mat) => (
                      <li key={mat.id}>
                        <a
                          href={mat.url}
                          download
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {mat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">No materials.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No active sessions right now.</p>
      )}
    </div>
  );

  // 🔹 Page Layout
  if (!user) return <p className="p-8 text-gray-500">You are logged out.</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">VidyaConnect Dashboard</h1>
        <div>
          <span className="mr-4 text-gray-700">
            Welcome, {user.email} ({user.role})
          </span>
          <button
            onClick={logout}
            className="px-4 py-2 text-white bg-red-500 rounded-md"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8">
        {user.role === 'TEACHER' ? <TeacherDashboard /> : <StudentDashboard />}
      </main>
    </div>
  );
};

export default DashboardPage;

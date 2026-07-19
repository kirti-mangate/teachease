
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "teacher" | "student";
  password?: string;
  department?: string;
  subject?: string;
  enrollmentNumber?: string;
  year?: string;
  branch?: string;
  faceDescriptor?: number[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  status: "present" | "absent";
  date: string;
  teacherId: string;
  subject: string;
  method: "manual" | "ai";
  createdAt: string;
}

export interface AIContent {
  id: string;
  topic: string;
  subject: string;
  content: string;
  teacherId: string;
  type: "assignment" | "note" | "ppt";
  difficulty?: string;
  createdAt: string;
}

class StorageService {
  private static instance: StorageService;

  private constructor() {
    // Initialize default data if empty or missing
    const existingUsers = localStorage.getItem("teachease_users");
    if (!existingUsers || JSON.parse(existingUsers).length === 0) {
      const demoUsers: UserProfile[] = [
        {
          uid: "teacher-123",
          name: "Dr. Elizabeth Smith",
          email: "teacher@example.com",
          password: "password123",
          role: "teacher",
          department: "Computer Science",
          subject: "Web Development"
        },
        {
          uid: "student-456",
          name: "Alex Johnson",
          email: "student@example.com",
          password: "password123",
          role: "student",
          enrollmentNumber: "TE-2024-001",
          year: "2024",
          branch: "CS"
        }
      ];
      localStorage.setItem("teachease_users", JSON.stringify(demoUsers));
    }
    if (!localStorage.getItem("teachease_attendance")) {
      localStorage.setItem("teachease_attendance", JSON.stringify([]));
    }
    if (!localStorage.getItem("teachease_content")) {
      localStorage.setItem("teachease_content", JSON.stringify([]));
    }
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Auth Methods
  public getUsers(): UserProfile[] {
    return JSON.parse(localStorage.getItem("teachease_users") || "[]");
  }

  public saveUser(user: UserProfile) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === user.uid);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem("teachease_users", JSON.stringify(users));
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  // Attendance
  public getAttendance(): AttendanceRecord[] {
    return JSON.parse(localStorage.getItem("teachease_attendance") || "[]");
  }

  public saveAttendance(records: AttendanceRecord[]) {
    const all = this.getAttendance();
    localStorage.setItem("teachease_attendance", JSON.stringify([...all, ...records]));
  }

  // AI Content
  public getContent(): AIContent[] {
    return JSON.parse(localStorage.getItem("teachease_content") || "[]");
  }

  public saveContent(content: AIContent) {
    const all = this.getContent();
    all.push(content);
    localStorage.setItem("teachease_content", JSON.stringify(all));
  }
}

export const storage = StorageService.getInstance();

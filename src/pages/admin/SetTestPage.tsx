import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Switch,
  Divider,
  Table,
  Modal,
  message,
  Tag,
  Select,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SettingOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { AppLayout } from '@components/layout';
import { subjectService } from '@services/subject.service';
import { courseService } from '@services/course.service';
import { setTestService } from '@services/setTest.service';
import type {
  TestSection,
  SubjectSectionInput,
  Subject,
  Course,
  SetTestListResponse,
  SetTestResponse,
  TestType,
} from '@app-types/index';

const { Title, Text } = Typography;

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Difficulty Distribution Component
interface DifficultyFieldsProps {
  totalQuestions: number;
  form: ReturnType<typeof Form.useForm>[0];
}

const DifficultyFields: React.FC<DifficultyFieldsProps> = ({ totalQuestions, form }) => {
  const l2 = Form.useWatch(['difficulty', 'L2'], form) || 0;
  const l3 = Form.useWatch(['difficulty', 'L3'], form) || 0;

  const l1 = Math.max(0, totalQuestions - l2 - l3);
  const isOverLimit = (l2 + l3) > totalQuestions;

  return (
    <Card size="small" title="Difficulty Distribution" style={{ marginTop: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label="L1 - Easy (Default)"
            style={{ flex: 1, marginBottom: 8 }}
          >
            <InputNumber
              value={l1}
              disabled
              style={{ width: '100%' }}
              status={isOverLimit ? 'error' : undefined}
            />
          </Form.Item>
          <Form.Item
            name={['difficulty', 'L2']}
            label="L2 - Medium"
            style={{ flex: 1, marginBottom: 8 }}
            initialValue={0}
          >
            <InputNumber min={0} max={totalQuestions} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name={['difficulty', 'L3']}
            label="L3 - Hard"
            style={{ flex: 1, marginBottom: 8 }}
            initialValue={0}
          >
            <InputNumber min={0} max={totalQuestions} style={{ width: '100%' }} />
          </Form.Item>
        </div>
        {isOverLimit && (
          <Text type="danger">
            L2+L3 ({l2 + l3}) exceeds total questions ({totalQuestions})
          </Text>
        )}
        <Text type="secondary">
          L1: {l1} | L2: {l2} | L3: {l3} = {l1 + l2 + l3} questions
        </Text>
      </Space>
    </Card>
  );
};

// Section form for Course and Subject test types
interface SectionFormProps {
  sections: TestSection[];
  onSectionsChange: (sections: TestSection[]) => void;
}

const SectionForm: React.FC<SectionFormProps> = ({ sections, onSectionsChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TestSection | null>(null);
  const [form] = Form.useForm();

  const questionCount = Form.useWatch('question_count', form) || 0;

  const handleAdd = () => {
    setEditingSection(null);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      question_count: 10,
      attempt_count: 10,
      marks_per_question: 4,
      negative_marks: 1,
      is_numerical: false,
      difficulty: { L2: 0, L3: 0 },
    });
    setIsModalOpen(true);
  };

  const handleEdit = (section: TestSection) => {
    setEditingSection(section);
    form.setFieldsValue(section);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Calculate L1 (default/remaining)
      const l2 = values.difficulty?.L2 || 0;
      const l3 = values.difficulty?.L3 || 0;
      const l1 = Math.max(0, values.question_count - l2 - l3);

      const sectionData = {
        ...values,
        difficulty: { L1: l1, L2: l2, L3: l3 },
      };

      if (editingSection) {
        onSectionsChange(
          sections.map((s) => (s.id === editingSection.id ? { ...s, ...sectionData } : s))
        );
      } else {
        onSectionsChange([...sections, { ...sectionData, id: generateId() }]);
      }
      setIsModalOpen(false);
    });
  };

  const columns = [
    { title: 'Section Name', dataIndex: 'name', key: 'name' },
    { title: 'Questions', dataIndex: 'question_count', key: 'question_count' },
    { title: 'To Attempt', dataIndex: 'attempt_count', key: 'attempt_count' },
    { title: 'Marks/Q', dataIndex: 'marks_per_question', key: 'marks_per_question' },
    { title: 'Negative', dataIndex: 'negative_marks', key: 'negative_marks' },
    {
      title: 'Type',
      dataIndex: 'is_numerical',
      key: 'is_numerical',
      render: (isNumerical: boolean) => (
        <Tag color={isNumerical ? 'blue' : 'green'}>
          {isNumerical ? 'Numerical' : 'MCQ'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: TestSection) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={sections}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
      <Button
        type="dashed"
        onClick={handleAdd}
        icon={<PlusOutlined />}
        style={{ marginTop: 16, width: '100%' }}
      >
        Add Section
      </Button>

      <Modal
        title={editingSection ? 'Edit Section' : 'Add Section'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Section Name"
            rules={[{ required: true, message: 'Please enter section name' }]}
          >
            <Input placeholder="e.g., Physics, Chemistry" />
          </Form.Item>
          <Form.Item
            name="question_count"
            label="Total Questions"
            rules={[{ required: true, message: 'Please enter question count' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="attempt_count"
            label="Questions to Attempt"
            rules={[{ required: true, message: 'Please enter attempt count' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="marks_per_question"
            label="Marks per Question"
            rules={[{ required: true, message: 'Please enter marks' }]}
          >
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="negative_marks"
            label="Negative Marks (per wrong answer)"
            rules={[{ required: true, message: 'Please enter negative marks' }]}
          >
            <InputNumber min={0} step={0.25} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="is_numerical"
            label="Numerical Value Questions"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>

          <DifficultyFields totalQuestions={questionCount} form={form} />
        </Form>
      </Modal>
    </>
  );
};

// Test Format List Component
interface TestFormatListProps {
  onEdit: (test: SetTestResponse) => void;
  onCreateNew: () => void;
  refreshKey: number;
}

const TestFormatList: React.FC<TestFormatListProps> = ({ onEdit, onCreateNew, refreshKey }) => {
  const [tests, setTests] = useState<SetTestListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<TestType | 'all'>('all');

  useEffect(() => {
    loadTests();
  }, [refreshKey]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await setTestService.getSetTests();
      setTests(data);
    } catch {
      message.error('Failed to load test formats');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await setTestService.deleteSetTest(id);
      message.success('Test format deleted successfully');
      loadTests();
    } catch {
      message.error('Failed to delete test format');
    }
  };

  const handleEditClick = async (id: string) => {
    try {
      const test = await setTestService.getSetTest(id);
      if (test) {
        onEdit(test);
      }
    } catch {
      message.error('Failed to load test format details');
    }
  };

  const filteredTests = filterType === 'all'
    ? tests
    : tests.filter(t => t.test_type === filterType);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'test_type',
      key: 'test_type',
      render: (type: TestType) => {
        const colors: Record<TestType, string> = {
          course: 'purple',
          subject: 'blue',
          chapter: 'cyan',
          topic: 'green',
        };
        return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Time Limit',
      dataIndex: 'time_limit_minutes',
      key: 'time_limit_minutes',
      render: (mins: number) => `${mins} mins`
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: SetTestListResponse) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this test format?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Text>Filter by type:</Text>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 150 }}
            options={[
              { label: 'All Types', value: 'all' },
              { label: 'Course', value: 'course' },
              { label: 'Subject', value: 'subject' },
              { label: 'Chapter', value: 'chapter' },
              { label: 'Topic', value: 'topic' },
            ]}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
          Create New Format
        </Button>
      </div>
      <Table
        dataSource={filteredTests}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

// Course Test Format Component
interface CourseTestFormatProps {
  editingTest?: SetTestResponse | null;
  onSave: () => void;
  onCancel: () => void;
}

const CourseTestFormat: React.FC<CourseTestFormatProps> = ({ editingTest, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [subjectSections, setSubjectSections] = useState<SubjectSectionInput[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
    loadCourses();
  }, []);

  useEffect(() => {
    if (editingTest) {
      form.setFieldsValue({
        name: editingTest.name,
        course_id: editingTest.course_id,
        time_limit_minutes: editingTest.time_limit_minutes,
        is_active: editingTest.is_active,
      });
      if (editingTest.subject_sections) {
        setSubjectSections(editingTest.subject_sections);
      }
    }
  }, [editingTest, form]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch {
      message.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch {
      message.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAddSubject = () => {
    setSelectedSubjectId(null);
    setIsSubjectModalOpen(true);
  };

  const handleConfirmAddSubject = () => {
    if (!selectedSubjectId) {
      message.warning('Please select a subject');
      return;
    }

    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject) return;

    // Check if subject already added
    if (subjectSections.some((s) => s.subject_id === selectedSubjectId)) {
      message.warning('This subject is already added');
      return;
    }

    setSubjectSections([
      ...subjectSections,
      { subject_id: subject.id, subject_name: subject.name, sections: [] },
    ]);
    setIsSubjectModalOpen(false);
    setSelectedSubjectId(null);
  };

  const handleRemoveSubject = (index: number) => {
    setSubjectSections(subjectSections.filter((_, i) => i !== index));
  };

  const handleSectionsChange = (index: number, sections: TestSection[]) => {
    const updated = [...subjectSections];
    updated[index].sections = sections;
    setSubjectSections(updated);
  };

  const handleSave = async () => {
    if (subjectSections.length === 0) {
      message.warning('Please add at least one subject');
      return;
    }

    // Validate each subject has at least one section
    const invalidSubject = subjectSections.find((s) => s.sections.length === 0);
    if (invalidSubject) {
      message.warning(`Please add at least one section to ${invalidSubject.subject_name}`);
      return;
    }

    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        name: values.name,
        time_limit_minutes: values.time_limit_minutes,
        is_active: values.is_active,
        course_id: values.course_id,
        subject_sections: subjectSections,
      };

      let result;
      if (editingTest) {
        result = await setTestService.updateCourseTest(editingTest.id, payload);
      } else {
        result = await setTestService.createCourseTest(payload);
      }

      if (result) {
        message.success(`Course test format ${editingTest ? 'updated' : 'saved'} successfully!`);
        onSave();
      }
    } catch {
      message.error(`Failed to ${editingTest ? 'update' : 'save'} course test format`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
      <Form.Item
        name="name"
        label="Format Name"
        rules={[{ required: true, message: 'Please enter format name' }]}
      >
        <Input placeholder="e.g., JEE Main Format" />
      </Form.Item>

      <Form.Item
        name="course_id"
        label="Course"
        rules={[{ required: true, message: 'Please select a course' }]}
      >
        <Select
          placeholder="Select a course"
          loading={loadingCourses}
          showSearch
          optionFilterProp="label"
          options={courses.map((c) => ({ label: c.name, value: c.id }))}
        />
      </Form.Item>

      <Form.Item
        name="time_limit_minutes"
        label="Time Limit (minutes)"
        rules={[{ required: true, message: 'Please enter time limit' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="180" />
      </Form.Item>

      <Form.Item name="is_active" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Divider>Subject Sections</Divider>

      {subjectSections.map((subject, index) => (
        <Card
          key={subject.subject_id}
          size="small"
          title={<Text strong>{subject.subject_name}</Text>}
          extra={
            <Button danger size="small" onClick={() => handleRemoveSubject(index)}>
              <DeleteOutlined />
            </Button>
          }
          style={{ marginBottom: 16 }}
        >
          <SectionForm
            sections={subject.sections}
            onSectionsChange={(sections) => handleSectionsChange(index, sections)}
          />
        </Card>
      ))}

      <Button
        type="dashed"
        onClick={handleAddSubject}
        icon={<PlusOutlined />}
        style={{ width: '100%', marginBottom: 24 }}
        loading={loadingSubjects}
      >
        Add Subject
      </Button>

      <Space style={{ width: '100%' }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
          {editingTest ? 'Update' : 'Save'} Course Test Format
        </Button>
      </Space>

      <Modal
        title="Select Subject"
        open={isSubjectModalOpen}
        onOk={handleConfirmAddSubject}
        onCancel={() => setIsSubjectModalOpen(false)}
        okText="Add Subject"
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select a subject"
          value={selectedSubjectId}
          onChange={setSelectedSubjectId}
          loading={loadingSubjects}
          showSearch
          optionFilterProp="label"
          options={subjects
            .filter((s) => !subjectSections.some((ss) => ss.subject_id === s.id))
            .map((s) => ({ label: s.name, value: s.id }))}
        />
      </Modal>
    </Form>
  );
};

// Subject Test Format Component
interface SubjectTestFormatProps {
  editingTest?: SetTestResponse | null;
  onSave: () => void;
  onCancel: () => void;
}

const SubjectTestFormat: React.FC<SubjectTestFormatProps> = ({ editingTest, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [sections, setSections] = useState<TestSection[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTest) {
      form.setFieldsValue({
        name: editingTest.name,
        time_limit_minutes: editingTest.time_limit_minutes,
        is_active: editingTest.is_active,
      });
      if (editingTest.sections) {
        setSections(editingTest.sections);
      }
    }
  }, [editingTest, form]);

  const handleSave = async () => {
    if (sections.length === 0) {
      message.warning('Please add at least one section');
      return;
    }

    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        name: values.name,
        time_limit_minutes: values.time_limit_minutes,
        is_active: values.is_active,
        subject_id: 'any',
        sections,
      };

      let result;
      if (editingTest) {
        result = await setTestService.updateSubjectTest(editingTest.id, payload);
      } else {
        result = await setTestService.createSubjectTest(payload);
      }

      if (result) {
        message.success(`Subject test format ${editingTest ? 'updated' : 'saved'} successfully!`);
        onSave();
      }
    } catch {
      message.error(`Failed to ${editingTest ? 'update' : 'save'} subject test format`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
      <Form.Item
        name="name"
        label="Format Name"
        rules={[{ required: true, message: 'Please enter format name' }]}
      >
        <Input placeholder="e.g., Subject Practice Test" />
      </Form.Item>

      <Form.Item
        name="time_limit_minutes"
        label="Time Limit (minutes)"
        rules={[{ required: true, message: 'Please enter time limit' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="60" />
      </Form.Item>

      <Form.Item name="is_active" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Divider>Sections</Divider>

      <SectionForm sections={sections} onSectionsChange={setSections} />

      <Space style={{ width: '100%', marginTop: 24 }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
          {editingTest ? 'Update' : 'Save'} Subject Test Format
        </Button>
      </Space>
    </Form>
  );
};

// Chapter Test Format Component
interface ChapterTestFormatProps {
  editingTest?: SetTestResponse | null;
  onSave: () => void;
  onCancel: () => void;
}

const ChapterTestFormat: React.FC<ChapterTestFormatProps> = ({ editingTest, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const questionCount = Form.useWatch('question_count', form) || 0;

  useEffect(() => {
    if (editingTest) {
      form.setFieldsValue({
        name: editingTest.name,
        time_limit_minutes: editingTest.time_limit_minutes,
        question_count: editingTest.question_count,
        marks_per_question: editingTest.marks_per_question,
        negative_marks: editingTest.negative_marks,
        is_active: editingTest.is_active,
        difficulty: {
          L2: editingTest.difficulty?.L2 || 0,
          L3: editingTest.difficulty?.L3 || 0,
        },
      });
    }
  }, [editingTest, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Calculate L1 (default/remaining)
      const l2 = values.difficulty?.L2 || 0;
      const l3 = values.difficulty?.L3 || 0;
      const l1 = Math.max(0, values.question_count - l2 - l3);

      const payload = {
        name: values.name,
        time_limit_minutes: values.time_limit_minutes,
        is_active: values.is_active,
        chapter_id: 'any',
        question_count: values.question_count,
        marks_per_question: values.marks_per_question,
        negative_marks: values.negative_marks || 0,
        difficulty: { L1: l1, L2: l2, L3: l3 },
      };

      let result;
      if (editingTest) {
        result = await setTestService.updateChapterTest(editingTest.id, payload);
      } else {
        result = await setTestService.createChapterTest(payload);
      }

      if (result) {
        message.success(`Chapter test format ${editingTest ? 'updated' : 'saved'} successfully!`);
        onSave();
      }
    } catch {
      message.error(`Failed to ${editingTest ? 'update' : 'save'} chapter test format`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ difficulty: { L2: 0, L3: 0 }, is_active: true }}>
      <Form.Item
        name="name"
        label="Format Name"
        rules={[{ required: true, message: 'Please enter format name' }]}
      >
        <Input placeholder="e.g., Chapter Quiz" />
      </Form.Item>

      <Form.Item
        name="time_limit_minutes"
        label="Time Limit (minutes)"
        rules={[{ required: true, message: 'Please enter time limit' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="30" />
      </Form.Item>

      <Form.Item
        name="question_count"
        label="Number of Questions"
        rules={[{ required: true, message: 'Please enter question count' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="20" />
      </Form.Item>

      <Form.Item
        name="marks_per_question"
        label="Marks per Question"
        rules={[{ required: true, message: 'Please enter marks' }]}
        initialValue={4}
      >
        <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="negative_marks"
        label="Negative Marks (per wrong answer)"
        initialValue={0}
      >
        <InputNumber min={0} step={0.25} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="is_active" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <DifficultyFields totalQuestions={questionCount} form={form} />

      <Space style={{ width: '100%', marginTop: 24 }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
          {editingTest ? 'Update' : 'Save'} Chapter Test Format
        </Button>
      </Space>
    </Form>
  );
};

// Topic Test Format Component
interface TopicTestFormatProps {
  editingTest?: SetTestResponse | null;
  onSave: () => void;
  onCancel: () => void;
}

const TopicTestFormat: React.FC<TopicTestFormatProps> = ({ editingTest, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const questionCount = Form.useWatch('question_count', form) || 0;

  useEffect(() => {
    if (editingTest) {
      form.setFieldsValue({
        name: editingTest.name,
        time_limit_minutes: editingTest.time_limit_minutes,
        question_count: editingTest.question_count,
        marks_per_question: editingTest.marks_per_question,
        negative_marks: editingTest.negative_marks,
        is_active: editingTest.is_active,
        difficulty: {
          L2: editingTest.difficulty?.L2 || 0,
          L3: editingTest.difficulty?.L3 || 0,
        },
      });
    }
  }, [editingTest, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Calculate L1 (default/remaining)
      const l2 = values.difficulty?.L2 || 0;
      const l3 = values.difficulty?.L3 || 0;
      const l1 = Math.max(0, values.question_count - l2 - l3);

      const payload = {
        name: values.name,
        time_limit_minutes: values.time_limit_minutes,
        is_active: values.is_active,
        topic_id: 'any',
        question_count: values.question_count,
        marks_per_question: values.marks_per_question,
        negative_marks: values.negative_marks || 0,
        difficulty: { L1: l1, L2: l2, L3: l3 },
      };

      let result;
      if (editingTest) {
        result = await setTestService.updateTopicTest(editingTest.id, payload);
      } else {
        result = await setTestService.createTopicTest(payload);
      }

      if (result) {
        message.success(`Topic test format ${editingTest ? 'updated' : 'saved'} successfully!`);
        onSave();
      }
    } catch {
      message.error(`Failed to ${editingTest ? 'update' : 'save'} topic test format`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={{ difficulty: { L2: 0, L3: 0 }, is_active: true }}>
      <Form.Item
        name="name"
        label="Format Name"
        rules={[{ required: true, message: 'Please enter format name' }]}
      >
        <Input placeholder="e.g., Topic Practice" />
      </Form.Item>

      <Form.Item
        name="time_limit_minutes"
        label="Time Limit (minutes)"
        rules={[{ required: true, message: 'Please enter time limit' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="15" />
      </Form.Item>

      <Form.Item
        name="question_count"
        label="Number of Questions"
        rules={[{ required: true, message: 'Please enter question count' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} placeholder="10" />
      </Form.Item>

      <Form.Item
        name="marks_per_question"
        label="Marks per Question"
        rules={[{ required: true, message: 'Please enter marks' }]}
        initialValue={4}
      >
        <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="negative_marks"
        label="Negative Marks (per wrong answer)"
        initialValue={0}
      >
        <InputNumber min={0} step={0.25} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="is_active" label="Active" valuePropName="checked">
        <Switch />
      </Form.Item>

      <DifficultyFields totalQuestions={questionCount} form={form} />

      <Space style={{ width: '100%', marginTop: 24 }}>
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
          {editingTest ? 'Update' : 'Save'} Topic Test Format
        </Button>
      </Space>
    </Form>
  );
};

// Main Set Test Page
export const SetTestPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingTest, setEditingTest] = useState<SetTestResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>('course');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (test: SetTestResponse) => {
    setEditingTest(test);
    setActiveTab(test.test_type);
    setView('edit');
  };

  const handleCreateNew = () => {
    setEditingTest(null);
    setView('create');
  };

  const handleSave = () => {
    setView('list');
    setEditingTest(null);
    setRefreshKey((k) => k + 1);
  };

  const handleCancel = () => {
    setView('list');
    setEditingTest(null);
  };

  const getFormComponent = () => {
    const isEditing = view === 'edit';
    const testForEdit = isEditing ? editingTest : null;

    switch (activeTab) {
      case 'course':
        return <CourseTestFormat editingTest={testForEdit} onSave={handleSave} onCancel={handleCancel} />;
      case 'subject':
        return <SubjectTestFormat editingTest={testForEdit} onSave={handleSave} onCancel={handleCancel} />;
      case 'chapter':
        return <ChapterTestFormat editingTest={testForEdit} onSave={handleSave} onCancel={handleCancel} />;
      case 'topic':
        return <TopicTestFormat editingTest={testForEdit} onSave={handleSave} onCancel={handleCancel} />;
      default:
        return null;
    }
  };

  const tabItems = [
    { key: 'course', label: 'Course Test' },
    { key: 'subject', label: 'Subject Test' },
    { key: 'chapter', label: 'Chapter Test' },
    { key: 'topic', label: 'Topic Test' },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: 12 }} />
          Set Test Format
        </Title>
        <Text type="secondary">
          Configure test formats for different test types. These formats will be used when generating tests.
        </Text>
      </div>

      <Card>
        {view === 'list' ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <UnorderedListOutlined style={{ marginRight: 8 }} />
              <Text strong>Test Formats</Text>
            </div>
            <TestFormatList
              onEdit={handleEdit}
              onCreateNew={handleCreateNew}
              refreshKey={refreshKey}
            />
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={handleCancel}
                style={{ paddingLeft: 0 }}
              >
                Back to List
              </Button>
            </div>
            <Title level={4}>
              {view === 'edit' ? 'Edit Test Format' : 'Create New Test Format'}
            </Title>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              style={{ marginBottom: 24 }}
            />
            {getFormComponent()}
          </>
        )}
      </Card>
    </AppLayout>
  );
};

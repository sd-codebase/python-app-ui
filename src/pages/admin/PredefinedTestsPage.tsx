import { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  message,
  Popconfirm,
  Progress,
  Descriptions,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AppLayout } from '@components/layout';
import { adminPredefinedTestService } from '@services/predefinedTest.service';
import { setTestService } from '@services/setTest.service';
import { courseService } from '@services/course.service';
import { subjectService } from '@services/subject.service';
import { chapterService } from '@services/chapter.service';
import { topicService } from '@services/topic.service';
import type {
  PredefinedTestListItem,
  PredefinedTestDetail,
  SetTestListResponse,
  GenerationStatus,
  TestType,
  Course,
  Subject,
  Chapter,
  Topic,
} from '@app-types/index';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
  pending: { color: 'default', icon: <SyncOutlined spin />, text: 'Pending' },
  in_progress: { color: 'processing', icon: <SyncOutlined spin />, text: 'In Progress' },
  published: { color: 'green', icon: <CheckCircleOutlined />, text: 'Published' },
  failed: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Failed' },
  archived: { color: 'default', icon: <CloseCircleOutlined />, text: 'Archived' },
};

export const AdminPredefinedTestsPage: React.FC = () => {
  const [tests, setTests] = useState<PredefinedTestListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<PredefinedTestDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Create form state
  const [createForm] = Form.useForm();
  const [setTests2, setSetTests] = useState<SetTestListResponse[]>([]);
  const [loadingSetTests, setLoadingSetTests] = useState(false);
  const [selectedSetTest, setSelectedSetTest] = useState<SetTestListResponse | null>(null);
  const [creating, setCreating] = useState(false);

  // Hierarchical selection state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Polling state
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());

  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminPredefinedTestService.getPredefinedTests();
      setTests(data);

      // Start polling for pending/in_progress tests
      const pendingTests = data.filter(t => t.status === 'pending' || t.status === 'in_progress');
      if (pendingTests.length > 0) {
        setPollingIds(new Set(pendingTests.map(t => t.id)));
      }
    } catch {
      message.error('Failed to load predefined tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  // Poll for generation status
  useEffect(() => {
    if (pollingIds.size === 0) return;

    const interval = setInterval(async () => {
      const idsToCheck = Array.from(pollingIds);
      const updatedIds = new Set(pollingIds);
      let needsRefresh = false;

      for (const id of idsToCheck) {
        try {
          const status = await adminPredefinedTestService.getGenerationStatus(id);
          if (status && (status.status === 'published' || status.status === 'failed')) {
            updatedIds.delete(id);
            needsRefresh = true;
          }
        } catch {
          // Ignore errors during polling
        }
      }

      if (needsRefresh) {
        loadTests();
      }
      setPollingIds(updatedIds);
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingIds, loadTests]);

  const loadSetTests = async () => {
    setLoadingSetTests(true);
    try {
      const data = await setTestService.getSetTests();
      setSetTests(data.filter(t => t.is_active));
    } catch {
      message.error('Failed to load set tests');
    } finally {
      setLoadingSetTests(false);
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

  const loadChaptersBySubject = async (subjectId: string) => {
    setLoadingChapters(true);
    setChapters([]);
    setTopics([]);
    try {
      const data = await chapterService.getChapters(subjectId);
      setChapters(data);
    } catch {
      message.error('Failed to load chapters');
    } finally {
      setLoadingChapters(false);
    }
  };

  const loadTopicsByChapter = async (chapterId: string) => {
    setLoadingTopics(true);
    setTopics([]);
    try {
      const data = await topicService.getTopics(chapterId);
      setTopics(data);
    } catch {
      message.error('Failed to load topics');
    } finally {
      setLoadingTopics(false);
    }
  };

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

  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setSelectedSetTest(null);
    setSubjects([]);
    setChapters([]);
    setTopics([]);
    setCourses([]);
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    loadSetTests();
    setIsCreateModalOpen(true);
  };

  const handleSetTestChange = (setTestId: string) => {
    const setTest = setTests2.find(t => t.id === setTestId);
    setSelectedSetTest(setTest || null);
    createForm.setFieldsValue({
      subject_id: undefined,
      chapter_id: undefined,
      reference_id: undefined,
    });
    setSelectedSubjectId(null);
    setSelectedChapterId(null);
    setChapters([]);
    setTopics([]);

    if (setTest) {
      if (setTest.test_type === 'topic' || setTest.test_type === 'chapter') {
        loadSubjects();
      } else if (setTest.test_type === 'subject') {
        loadSubjects();
      } else if (setTest.test_type === 'course') {
        loadCourses();
      }
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedChapterId(null);
    createForm.setFieldsValue({
      chapter_id: undefined,
      reference_id: undefined,
    });
    setTopics([]);

    if (selectedSetTest?.test_type === 'subject') {
      createForm.setFieldValue('reference_id', subjectId);
    } else {
      loadChaptersBySubject(subjectId);
    }
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    createForm.setFieldValue('reference_id', undefined);

    if (selectedSetTest?.test_type === 'chapter') {
      createForm.setFieldValue('reference_id', chapterId);
    } else if (selectedSetTest?.test_type === 'topic') {
      loadTopicsByChapter(chapterId);
    }
  };

  const handleTopicChange = (topicId: string) => {
    createForm.setFieldValue('reference_id', topicId);
  };

  const handleCourseChange = (courseId: string) => {
    createForm.setFieldValue('reference_id', courseId);
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreating(true);

      const result = await adminPredefinedTestService.createPredefinedTest({
        set_test_id: values.set_test_id,
        reference_id: values.reference_id,
        name: values.name,
      });

      if (result) {
        message.success('Test generation started');
        setIsCreateModalOpen(false);
        loadTests();
      }
    } catch {
      message.error('Failed to create predefined test');
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const data = await adminPredefinedTestService.getPredefinedTest(id);
      setSelectedTest(data);
    } catch {
      message.error('Failed to load test details');
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await adminPredefinedTestService.archiveTest(id);
      message.success('Test archived');
      loadTests();
    } catch {
      message.error('Failed to archive test');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminPredefinedTestService.publishTest(id);
      message.success('Test published');
      loadTests();
    } catch {
      message.error('Failed to publish test');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminPredefinedTestService.deleteTest(id);
      message.success('Test deleted');
      loadTests();
    } catch {
      message.error('Failed to delete test');
    }
  };

  const columns: ColumnsType<PredefinedTestListItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
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
      },
    },
    {
      title: 'Reference',
      dataIndex: 'reference_name',
      key: 'reference_name',
    },
    {
      title: 'Format',
      dataIndex: 'set_test_name',
      key: 'set_test_name',
      render: (name: string) => <Text type="secondary">{name}</Text>,
    },
    {
      title: 'Questions',
      dataIndex: 'total_questions',
      key: 'total_questions',
    },
    {
      title: 'Time',
      dataIndex: 'time_limit_minutes',
      key: 'time_limit_minutes',
      render: (mins: number) => `${mins} mins`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: GenerationStatus) => {
        const config = statusConfig[status] || { color: 'default', icon: null, text: status || 'Unknown' };
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Published',
      dataIndex: 'status',
      key: 'is_published',
      render: (status: string) => {
        const isPublished = status === 'published';
        return (
          <Tag
            icon={isPublished ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={isPublished ? 'success' : 'default'}
          >
            {isPublished ? 'Yes' : 'No'}
          </Tag>
        );
      },
    },
    {
      title: 'Attempts',
      dataIndex: 'attempt_count',
      key: 'attempt_count',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => {
        const isPublished = record.status === 'published';
        const isArchived = record.status === 'archived';
        const canManage = isPublished || isArchived;

        return (
          <Space size="small">
            {canManage && (
              <>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record.id)}
                />
                {isPublished ? (
                  <Popconfirm
                    title="Archive this test?"
                    description="Users won't be able to take this test."
                    onConfirm={() => handleArchive(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button size="small">Archive</Button>
                  </Popconfirm>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handlePublish(record.id)}
                  >
                    Publish
                  </Button>
                )}
              </>
            )}
            <Popconfirm
              title="Delete this test?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Predefined Tests</Title>
        <Text type="secondary">
          Create and manage predefined tests for users. Tests are generated using Set Test formats.
        </Text>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button icon={<ReloadOutlined />} onClick={loadTests} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
            Create Predefined Test
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Create Predefined Test"
        open={isCreateModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
        confirmLoading={creating}
        okText="Generate Test"
        width={500}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="set_test_id"
            label="Test Format"
            rules={[{ required: true, message: 'Please select a test format' }]}
          >
            <Select
              placeholder="Select a test format"
              loading={loadingSetTests}
              onChange={handleSetTestChange}
              showSearch
              optionFilterProp="label"
              options={setTests2.map(t => ({
                label: `${t.name} (${t.test_type})`,
                value: t.id,
              }))}
            />
          </Form.Item>

          {/* Course Test - Direct course selection */}
          {selectedSetTest?.test_type === 'course' && (
            <Form.Item
              name="reference_id"
              label="Select Course"
              rules={[{ required: true, message: 'Please select a course' }]}
            >
              <Select
                placeholder="Select a course"
                loading={loadingCourses}
                showSearch
                optionFilterProp="label"
                onChange={handleCourseChange}
                options={courses.map(c => ({
                  label: c.name,
                  value: c.id,
                }))}
              />
            </Form.Item>
          )}

          {/* Subject Test - Direct subject selection */}
          {selectedSetTest?.test_type === 'subject' && (
            <Form.Item
              name="reference_id"
              label="Select Subject"
              rules={[{ required: true, message: 'Please select a subject' }]}
            >
              <Select
                placeholder="Select a subject"
                loading={loadingSubjects}
                showSearch
                optionFilterProp="label"
                onChange={handleSubjectChange}
                options={subjects.map(s => ({
                  label: s.name,
                  value: s.id,
                }))}
              />
            </Form.Item>
          )}

          {/* Chapter Test - Subject → Chapter hierarchy */}
          {selectedSetTest?.test_type === 'chapter' && (
            <>
              <Form.Item
                name="subject_id"
                label="Select Subject"
                rules={[{ required: true, message: 'Please select a subject' }]}
              >
                <Select
                  placeholder="Select a subject"
                  loading={loadingSubjects}
                  showSearch
                  optionFilterProp="label"
                  onChange={handleSubjectChange}
                  options={subjects.map(s => ({
                    label: s.name,
                    value: s.id,
                  }))}
                />
              </Form.Item>
              {selectedSubjectId && (
                <Form.Item
                  name="reference_id"
                  label="Select Chapter"
                  rules={[{ required: true, message: 'Please select a chapter' }]}
                >
                  <Select
                    placeholder="Select a chapter"
                    loading={loadingChapters}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleChapterChange}
                    options={chapters.map(c => ({
                      label: c.name,
                      value: c.id,
                    }))}
                  />
                </Form.Item>
              )}
            </>
          )}

          {/* Topic Test - Subject → Chapter → Topic hierarchy */}
          {selectedSetTest?.test_type === 'topic' && (
            <>
              <Form.Item
                name="subject_id"
                label="Select Subject"
                rules={[{ required: true, message: 'Please select a subject' }]}
              >
                <Select
                  placeholder="Select a subject"
                  loading={loadingSubjects}
                  showSearch
                  optionFilterProp="label"
                  onChange={handleSubjectChange}
                  options={subjects.map(s => ({
                    label: s.name,
                    value: s.id,
                  }))}
                />
              </Form.Item>
              {selectedSubjectId && (
                <Form.Item
                  name="chapter_id"
                  label="Select Chapter"
                  rules={[{ required: true, message: 'Please select a chapter' }]}
                >
                  <Select
                    placeholder="Select a chapter"
                    loading={loadingChapters}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleChapterChange}
                    options={chapters.map(c => ({
                      label: c.name,
                      value: c.id,
                    }))}
                  />
                </Form.Item>
              )}
              {selectedChapterId && (
                <Form.Item
                  name="reference_id"
                  label="Select Topic"
                  rules={[{ required: true, message: 'Please select a topic' }]}
                >
                  <Select
                    placeholder="Select a topic"
                    loading={loadingTopics}
                    showSearch
                    optionFilterProp="label"
                    onChange={handleTopicChange}
                    options={topics.map(t => ({
                      label: t.name,
                      value: t.id,
                    }))}
                  />
                </Form.Item>
              )}
            </>
          )}

          <Form.Item
            name="name"
            label="Test Name (Optional)"
            help="Leave empty to auto-generate name"
          >
            <Input placeholder="e.g., Physics Chapter 1 Test" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Test Details"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedTest(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : selectedTest ? (
          <>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Name">{selectedTest.name}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag>{selectedTest.test_type.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reference">{selectedTest.reference_name}</Descriptions.Item>
              <Descriptions.Item label="Format">{selectedTest.set_test_name}</Descriptions.Item>
              <Descriptions.Item label="Total Questions">{selectedTest.total_questions}</Descriptions.Item>
              <Descriptions.Item label="Time Limit">{selectedTest.time_limit_minutes} mins</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={(statusConfig[selectedTest.status] || statusConfig.pending).color}>
                  {(statusConfig[selectedTest.status] || statusConfig.pending).text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Published">
                <Tag color={selectedTest.status === 'published' ? 'success' : 'default'}>
                  {selectedTest.status === 'published' ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Attempts">{selectedTest.attempt_count}</Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(selectedTest.created_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {selectedTest.difficulty && (
              <Card size="small" title="Difficulty Distribution" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>L1 (Easy): {selectedTest.difficulty.L1}</Text>
                    <Progress
                      percent={Math.round((selectedTest.difficulty.L1 / selectedTest.total_questions) * 100)}
                      size="small"
                      strokeColor="#52c41a"
                    />
                  </div>
                  <div>
                    <Text>L2 (Medium): {selectedTest.difficulty.L2}</Text>
                    <Progress
                      percent={Math.round((selectedTest.difficulty.L2 / selectedTest.total_questions) * 100)}
                      size="small"
                      strokeColor="#faad14"
                    />
                  </div>
                  <div>
                    <Text>L3 (Hard): {selectedTest.difficulty.L3}</Text>
                    <Progress
                      percent={Math.round((selectedTest.difficulty.L3 / selectedTest.total_questions) * 100)}
                      size="small"
                      strokeColor="#f5222d"
                    />
                  </div>
                </Space>
              </Card>
            )}

            <Card size="small" title={`Questions (${selectedTest.questions.length})`} style={{ marginTop: 16 }}>
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {selectedTest.questions.map((q, index) => (
                  <div key={q.question_id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <Text strong>Q{index + 1}:</Text> <Text>{q.question}</Text>
                    {q.options && (
                      <div style={{ marginTop: 4, marginLeft: 20 }}>
                        {Object.entries(q.options).map(([key, value]) => (
                          <div key={key}>
                            <Text type="secondary">{key})</Text> {value}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.has_integer_answer && (
                      <Tag style={{ marginTop: 4 }}>Numerical</Tag>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : null}
      </Modal>
    </AppLayout>
  );
};

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Tabs,
  Modal,
  Radio,
  Checkbox,
  Input,
  message,
  Progress,
  Statistic,
  Row,
  Col,
  Divider,
  Result,
  Select,
} from 'antd';
import {
  PlayCircleOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AppLayout } from '@components/layout';
import { userPredefinedTestService } from '@services/predefinedTest.service';
import type {
  AvailablePredefinedTest,
  OngoingAttempt,
  AttemptHistoryItem,
  ReviewAttemptResponse,
  SubmitAttemptResponse,
  TestType,
} from '@app-types/index';
import type { PredefinedTestQuestion } from '@app-types/predefinedTest.types';
import {
  ABCD,
  TRUE_FALSE,
  hasOptionText,
  isNumericDraft,
  parseOptionList,
  resolveAnswerKind,
} from '@utils/questionType';

const { Title, Text, Paragraph } = Typography;
const { Countdown } = Statistic;

type ViewMode = 'list' | 'test' | 'result' | 'review';

export const UserPredefinedTestsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState('available');
  const [filterType, setFilterType] = useState<TestType | 'all'>('all');

  // Available tests
  const [availableTests, setAvailableTests] = useState<AvailablePredefinedTest[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Test taking
  const [currentAttempt, setCurrentAttempt] = useState<OngoingAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<SubmitAttemptResponse | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // History
  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Review
  const [reviewData, setReviewData] = useState<ReviewAttemptResponse | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const loadAvailableTests = useCallback(async () => {
    setLoadingAvailable(true);
    try {
      const data = await userPredefinedTestService.getAvailableTests();
      setAvailableTests(data);
    } catch {
      message.error('Failed to load available tests');
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await userPredefinedTestService.getAttemptHistory();
      setHistory(data);
    } catch {
      message.error('Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadAvailableTests();
    loadHistory();
  }, [loadAvailableTests, loadHistory]);

  // Auto-save progress
  useEffect(() => {
    if (currentAttempt && viewMode === 'test') {
      autoSaveRef.current = setInterval(async () => {
        try {
          await userPredefinedTestService.saveProgress(currentAttempt.attempt_id, {
            answers: toAnswerItems(currentAttempt, answers),
          });
        } catch {
          // Silent fail for auto-save
        }
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [currentAttempt, answers, viewMode]);

  const handleStartTest = async (testId: string) => {
    try {
      const response = await userPredefinedTestService.startAttempt(testId);
      if (response) {
        setCurrentAttempt({
          attempt_id: response.attempt_id,
          test_id: response.test_id,
          test_name: response.test_name,
          total_questions: response.total_questions,
          time_limit_minutes: response.time_limit_minutes,
          started_at: response.started_at,
          time_remaining_seconds: response.time_limit_minutes * 60,
          questions: response.questions,
          answers: {},
        });
        setAnswers({});
        setCurrentQuestionIndex(0);
        setViewMode('test');
      }
    } catch {
      message.error('Failed to start test');
    }
  };

  const handleAnswerChange = (questionId: string, answer: string | null) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // The backend expects a list of { question_id, user_answer }.
  const toAnswerItems = (attempt: OngoingAttempt, record: Record<string, string | null>) =>
    attempt.questions.map((q) => {
      const value = record[q.question_id];
      return {
        question_id: q.question_id,
        user_answer: value === undefined || value === '' ? null : value,
      };
    });

  const handleSubmitTest = async () => {
    if (!currentAttempt) return;

    Modal.confirm({
      title: 'Submit Test?',
      content: 'Are you sure you want to submit the test? This action cannot be undone.',
      onOk: async () => {
        setSubmitting(true);
        try {
          const result = await userPredefinedTestService.submitAttempt(
            currentAttempt.attempt_id,
            { answers: toAnswerItems(currentAttempt, answers) }
          );
          if (result) {
            setTestResult(result);
            setViewMode('result');
            loadHistory();
          }
        } catch {
          message.error('Failed to submit test');
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleTimeUp = () => {
    message.warning('Time is up! Submitting your test...');
    handleForceSubmit();
  };

  const handleForceSubmit = async () => {
    if (!currentAttempt) return;
    setSubmitting(true);
    try {
      const result = await userPredefinedTestService.submitAttempt(
        currentAttempt.attempt_id,
        { answers: toAnswerItems(currentAttempt, answers) }
      );
      if (result) {
        setTestResult(result);
        setViewMode('result');
        loadHistory();
      }
    } catch {
      message.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAttempt = async (attemptId: string) => {
    setLoadingReview(true);
    setViewMode('review');
    try {
      const data = await userPredefinedTestService.reviewAttempt(attemptId);
      setReviewData(data);
    } catch {
      message.error('Failed to load review');
      setViewMode('list');
    } finally {
      setLoadingReview(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentAttempt(null);
    setTestResult(null);
    setReviewData(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const filteredTests = filterType === 'all'
    ? availableTests
    : availableTests.filter(t => t.test_type === filterType);

  const availableColumns: ColumnsType<AvailablePredefinedTest> = [
    {
      title: 'Test Name',
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
      title: 'Questions',
      dataIndex: 'total_questions',
      key: 'total_questions',
    },
    {
      title: 'Duration',
      dataIndex: 'time_limit_minutes',
      key: 'time_limit_minutes',
      render: (mins: number) => `${mins} mins`,
    },
    {
      title: 'Your Attempts',
      dataIndex: 'user_attempts',
      key: 'user_attempts',
    },
    {
      title: 'Best Score',
      dataIndex: 'best_score',
      key: 'best_score',
      render: (score: number | null) => score !== null ? `${score}%` : '-',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => handleStartTest(record.id)}
        >
          Start Test
        </Button>
      ),
    },
  ];

  const historyColumns: ColumnsType<AttemptHistoryItem> = [
    {
      title: 'Test Name',
      dataIndex: 'test_name',
      key: 'test_name',
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
      title: 'Score',
      key: 'score',
      render: (_, record) => (
        <Space>
          <Text>{record.score}/{record.max_score}</Text>
          <Tag color={record.percentage >= 60 ? 'success' : record.percentage >= 40 ? 'warning' : 'error'}>
            {record.percentage.toFixed(1)}%
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Correct',
      dataIndex: 'correct_count',
      key: 'correct_count',
      render: (count: number, record) => `${count}/${record.total_questions}`,
    },
    {
      title: 'Time Taken',
      dataIndex: 'time_taken_seconds',
      key: 'time_taken_seconds',
      render: (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}m ${remainingSecs}s`;
      },
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleReviewAttempt(record.attempt_id)}
        >
          Review
        </Button>
      ),
    },
  ];

  // Answer input by question type:
  //   true_false -> two buttons, True / False
  //   multiple   -> tick any of a-d, sent as "a,c"
  //   numerical  -> number input
  //   single     -> choose one of a-d (NEET / JEE Main and most JEE Advanced types)
  const renderAnswerInput = (q: PredefinedTestQuestion) => {
    const value = answers[q.question_id] ?? null;
    const kind = resolveAnswerKind(q.has_integer_answer, q.type);
    const withText = hasOptionText(q.options);
    const optionKeys = withText ? Object.keys(q.options!) : ABCD;

    if (kind === 'numerical') {
      return (
        <Input
          placeholder="Enter your answer"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => {
            if (isNumericDraft(e.target.value)) handleAnswerChange(q.question_id, e.target.value);
          }}
          style={{ width: 200 }}
        />
      );
    }

    if (kind === 'true_false') {
      return (
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={value}
          onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
        >
          {TRUE_FALSE.map((tf) => (
            <Radio.Button key={tf} value={tf} style={{ minWidth: 96, textAlign: 'center' }}>
              {tf}
            </Radio.Button>
          ))}
        </Radio.Group>
      );
    }

    if (kind === 'multiple') {
      const selected = parseOptionList(value);
      return (
        <Checkbox.Group
          value={selected}
          onChange={(checked) => {
            const next = (checked as string[]).slice().sort();
            handleAnswerChange(q.question_id, next.length ? next.join(',') : null);
          }}
          style={{ width: '100%' }}
        >
          <Space direction={withText ? 'vertical' : 'horizontal'} style={{ width: '100%' }}>
            {optionKeys.map((key) => (
              <Checkbox key={key} value={key} style={{ padding: 8 }}>
                <Text>{withText ? `${key}) ${q.options![key]}` : key}</Text>
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
      );
    }

    if (!withText) {
      return (
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={value}
          onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
        >
          {ABCD.map((key) => (
            <Radio.Button key={key} value={key} style={{ minWidth: 56, textAlign: 'center' }}>
              {key}
            </Radio.Button>
          ))}
        </Radio.Group>
      );
    }

    return (
      <Radio.Group
        value={value}
        onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {optionKeys.map((key) => (
            <Radio key={key} value={key} style={{ padding: 8 }}>
              <Text>{key}) {q.options![key]}</Text>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    );
  };

  // Render test taking view
  if (viewMode === 'test' && currentAttempt) {
    const currentQuestion = currentAttempt.questions[currentQuestionIndex];
    const answeredCount = Object.values(answers).filter(a => a !== null && a !== '').length;
    const deadline = new Date(currentAttempt.started_at).getTime() + currentAttempt.time_limit_minutes * 60 * 1000;

    return (
      <AppLayout>
        <Card>
          <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
            <Col flex="auto">
              <Title level={4} style={{ margin: 0 }}>{currentAttempt.test_name}</Title>
            </Col>
            <Col>
              <Space size="large">
                <Statistic
                  title="Answered"
                  value={answeredCount}
                  suffix={`/ ${currentAttempt.total_questions}`}
                />
                <Countdown
                  title="Time Remaining"
                  value={deadline}
                  onFinish={handleTimeUp}
                  format="HH:mm:ss"
                />
              </Space>
            </Col>
          </Row>

          <Progress
            percent={Math.round((currentQuestionIndex + 1) / currentAttempt.total_questions * 100)}
            size="small"
            style={{ marginBottom: 16 }}
          />

          <Card style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 16 }}>
              Question {currentQuestionIndex + 1} of {currentAttempt.total_questions}
            </Text>
            <Paragraph style={{ fontSize: 16, marginTop: 16 }}>
              {currentQuestion.question}
            </Paragraph>

            {renderAnswerInput(currentQuestion)}
          </Card>

          <Row gutter={16}>
            <Col span={12}>
              <Button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              >
                Previous
              </Button>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Space>
                {currentQuestionIndex < currentAttempt.total_questions - 1 ? (
                  <Button
                    type="primary"
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmitTest}
                    loading={submitting}
                  >
                    Submit Test
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          <Divider>Question Navigator</Divider>
          <Space wrap>
            {currentAttempt.questions.map((q, idx) => {
              const isAnswered = answers[q.question_id] !== null && answers[q.question_id] !== '' && answers[q.question_id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <Button
                  key={q.question_id}
                  type={isCurrent ? 'primary' : isAnswered ? 'default' : 'dashed'}
                  size="small"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  style={{
                    backgroundColor: isAnswered && !isCurrent ? '#e6f7ff' : undefined,
                  }}
                >
                  {idx + 1}
                </Button>
              );
            })}
          </Space>
        </Card>
      </AppLayout>
    );
  }

  // Render result view
  if (viewMode === 'result' && testResult) {
    const isPassed = testResult.percentage >= 60;
    return (
      <AppLayout>
        <Result
          status={isPassed ? 'success' : 'warning'}
          icon={isPassed ? <TrophyOutlined /> : undefined}
          title={isPassed ? 'Congratulations!' : 'Test Completed'}
          subTitle={`You scored ${testResult.percentage.toFixed(1)}%`}
          extra={[
            <Button key="back" onClick={handleBackToList}>
              Back to Tests
            </Button>,
            <Button key="history" type="primary" onClick={() => { setViewMode('list'); setActiveTab('history'); }}>
              View History
            </Button>,
          ]}
        >
          <Card>
            <Row gutter={[32, 16]}>
              <Col span={8}>
                <Statistic
                  title="Score"
                  value={testResult.score}
                  suffix={`/ ${testResult.max_score}`}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Correct Answers"
                  value={testResult.correct_count}
                  suffix={`/ ${testResult.total_questions}`}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Wrong Answers"
                  value={testResult.wrong_count}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Unanswered"
                  value={testResult.unanswered}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Time Taken"
                  value={testResult.time_taken_seconds != null ? Math.floor(testResult.time_taken_seconds / 60) : '-'}
                  suffix="mins"
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Percentage"
                  value={testResult.percentage.toFixed(1)}
                  suffix="%"
                />
              </Col>
            </Row>
          </Card>
        </Result>
      </AppLayout>
    );
  }

  // Render review view
  if (viewMode === 'review') {
    if (loadingReview) {
      return (
        <AppLayout>
          <Card loading style={{ minHeight: 400 }} />
        </AppLayout>
      );
    }

    if (reviewData) {
      const reviewMeta = history.find((h) => h.attempt_id === reviewData.attempt_id);
      return (
        <AppLayout>
          <Card>
            <Button onClick={handleBackToList} style={{ marginBottom: 16 }}>
              Back to Tests
            </Button>

            <Title level={4}>{reviewMeta?.test_name ?? 'Review'}</Title>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              {reviewMeta?.test_type && (
                <Col>
                  <Tag color="blue">{reviewMeta.test_type.toUpperCase()}</Tag>
                </Col>
              )}
              <Col>
                <Text>Score: {reviewData.score}/{reviewData.max_score} ({reviewData.percentage.toFixed(1)}%)</Text>
              </Col>
              <Col>
                <Text type="success">Correct: {reviewData.correct_count}</Text>
              </Col>
              <Col>
                <Text type="danger">Wrong: {reviewData.wrong_count}</Text>
              </Col>
              <Col>
                <Text type="secondary">Unanswered: {reviewData.unanswered}</Text>
              </Col>
            </Row>

            <Divider>Questions & Answers</Divider>

            {reviewData.results.map((r, idx) => {
              const answered = r.user_answer !== null && r.user_answer !== '';
              const kind = resolveAnswerKind(r.has_integer_answer, r.type);
              return (
                <Card
                  key={r.question_id}
                  size="small"
                  style={{
                    marginBottom: 16,
                    borderLeft: `4px solid ${r.is_correct ? '#52c41a' : answered ? '#f5222d' : '#faad14'}`,
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Tag color={r.is_correct ? 'success' : answered ? 'error' : 'warning'}>
                        {r.is_correct ? 'Correct' : answered ? 'Wrong' : 'Unanswered'}
                      </Tag>
                      <Text strong> Q{idx + 1}</Text>
                    </div>
                    {kind === 'numerical' ? (
                      <div style={{ marginLeft: 20 }}>
                        <Text>Your Answer: </Text>
                        <Text type={r.is_correct ? 'success' : 'danger'}>{r.user_answer || 'Not answered'}</Text>
                        <br />
                        <Text>Correct Answer: </Text>
                        <Text type="success">{r.correct_answer}</Text>
                      </div>
                    ) : (
                      <Space wrap style={{ marginLeft: 20 }}>
                        {(kind === 'true_false' ? TRUE_FALSE : ABCD).map((key) => {
                          const k = key.toLowerCase();
                          const isCorrect = parseOptionList(r.correct_answer).includes(k);
                          const isUser = parseOptionList(r.user_answer).includes(k);
                          return (
                            <Tag
                              key={key}
                              color={isCorrect ? 'success' : isUser ? 'error' : undefined}
                              style={{ minWidth: 48, textAlign: 'center', padding: '2px 10px' }}
                            >
                              {key}
                              {isCorrect ? ' ✓' : isUser ? ' ✗' : ''}
                            </Tag>
                          );
                        })}
                      </Space>
                    )}
                  </Space>
                </Card>
              );
            })}
          </Card>
        </AppLayout>
      );
    }
  }

  // Render list view
  const tabItems = [
    {
      key: 'available',
      label: (
        <span>
          <PlayCircleOutlined />
          Available Tests
        </span>
      ),
      children: (
        <>
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
          </div>
          <Table
            columns={availableColumns}
            dataSource={filteredTests}
            rowKey="id"
            loading={loadingAvailable}
            pagination={{ pageSize: 10 }}
          />
        </>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          My History
        </span>
      ),
      children: (
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="attempt_id"
          loading={loadingHistory}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <PlayCircleOutlined style={{ marginRight: 12 }} />
          Predefined Tests
        </Title>
        <Text type="secondary">
          Take predefined tests created by administrators and track your progress.
        </Text>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </AppLayout>
  );
};

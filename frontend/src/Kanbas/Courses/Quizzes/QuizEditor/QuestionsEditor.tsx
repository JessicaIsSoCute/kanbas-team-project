import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as client from "../client";
import { useEffect, useState } from "react";
import { setQuiz, updateQuiz, setQuestion } from "../reducer";
import { FaEdit, FaPlus } from "react-icons/fa";
import { Modal } from "react-bootstrap";
import UpdateQuestionBody from "./UpdateQuestionBody";

export default function QuestionsEditor() {
    const { cid, qid } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const question = useSelector((state) => state.quizzesReducer.question);
    const quiz = useSelector((state) => state.quizzesReducer.quiz);
    const [questionNumber, setQuestionNumber] = useState(-1);
    const [showQuestionModal, setShowQuestionModal] = useState(false);

    useEffect(() => {
        if (qid) {
            client.findQuizByQuizId(qid).then((quiz) => {
                dispatch(setQuiz(quiz));
                setQuestionNumber(quiz.questions.length);
            });
        }
    }, [qid, dispatch]);

    const handleSave = async () => {
        const updatedQuizData = await client.updateQuiz(quiz);
        dispatch(updateQuiz(updatedQuizData));
        navigate(`/Kanbas/Courses/${cid}/Quizzes`);
    };
    const validateQuestion = () => {
        if (!question.questionText.trim()) {
            return "Please enter the question text.";
        }
        switch (question.questionType) {
            case "MULTIPLE_CHOICE":
                if (!question.multipleChoiceQuestionAnswers || question.multipleChoiceQuestionAnswers.length === 0) {
                    return "Please select a correct answer for the multiple choice question.";
                }
                break;
            case "TRUE_FALSE":
                if (question.trueFalseAnswer === "") {
                    return "Please select the correct answer for the true/false question.";
                }
                break;
            case "FILL_IN":
                if (!question.fillInBlankAnswers || question.fillInBlankAnswers.length === 0) {
                    return "Please provide at least one correct answer for the fill-in-the-blank question.";
                }
                break;
            default:
                break;
        }
        return null;
    };
    const handleUpdateQuestion = async () => {
        const validationError = validateQuestion();
        if (validationError) {
            alert(validationError);
            return;
        }
        if (questionNumber >= 0 && questionNumber <= quiz.questions.length) {
            let updatedQuiz;
            if (questionNumber === quiz.questions.length) {
                // Adding a new question
                updatedQuiz = { ...quiz, questions: [...quiz.questions, question] };
            } else {
                // Updating an existing question
                updatedQuiz = {
                    ...quiz,
                    questions: [
                        ...quiz.questions.slice(0, questionNumber),
                        question,
                        ...quiz.questions.slice(questionNumber + 1)
                    ]
                };
            }
            const updatedQuizData = await client.updateQuiz(updatedQuiz);
            dispatch(updateQuiz(updatedQuizData));
            navigate(`/Kanbas/Courses/${cid}/Quizzes/${qid}/edit`);
            setShowQuestionModal(false);
        } else {
            console.error("Invalid question number");
        }
    };
    const handleEditQuestion = (index) => {
        dispatch(setQuestion(quiz.questions[index]));
        setQuestionNumber(index);
        setShowQuestionModal(true);
    };

    return (
        <div>
            <Modal show={showQuestionModal} size="xl" onHide={() => setShowQuestionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editing Question: {question.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <UpdateQuestionBody />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-start">
                    <button type="button" className="btn btn-light p-2 m-2" onClick={() => setShowQuestionModal(false)}>
                        Cancel
                    </button>
                    <button type="button" className="btn btn-danger p-2 m-2" onClick={handleUpdateQuestion}>
                        {questionNumber === quiz.questions.length ? "Add Question" : "Update Question"}
                    </button>
                </Modal.Footer>
            </Modal>

            <div className="d-flex justify-content-center p-3 m-3">
                <button className="btn btn-secondary m-2" onClick={() => {
                    dispatch(setQuestion({
                        title: `Question ${quiz.questions.length + 1}`,
                        questionText: "",
                        questionType: "",
                        points: 0,
                        multipleChoiceQuestionAnswers: [],
                        trueFalseAnswer: "",
                        fillInBlankAnswers: []
                    }));
                    setShowQuestionModal(true);
                    setQuestionNumber(quiz.questions.length);
                }}>
                    <FaPlus /> New Question
                </button>
            </div>
            <hr />
            {quiz.questions.map((q, i) => (
                <div key={i} className="row align-items-center mb-2">
                    <div className="col-md-8">
                        <strong>{q.title}</strong> - {q.questionText}
                    </div>
                    <div className="col-md-4 text-end">
                        <button className="btn btn-light" onClick={() => handleEditQuestion(i)}>
                            <FaEdit /> Edit
                        </button>
                    </div>
                </div>
            ))}
            <div className="col d-flex justify-content-center p-3 m-3">
                <Link to={`/Kanbas/Courses/${cid}/Quizzes`} className="btn btn-light float-end m-2">Cancel</Link>
                <button onClick={handleSave} className="btn btn-danger m-2 float-end">Save</button>
            </div>
            {/* <pre>{JSON.stringify(quiz.questions, null, 2)}</pre> */}
        </div>
    );
}


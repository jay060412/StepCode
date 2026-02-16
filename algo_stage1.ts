import { Lesson } from './types';

export const algo_stage1: Lesson = {
  id: 'tut1',
  title: 'STAGE 1. 프로그램이란?',
  description: '코딩을 배우기 전에, 프로그램이 무엇인지 아주 간단히 알아봅니다.',
  category: 'tutorial',
  status: 'current',
  pages: [
    {
      id: 'tut1_p1',
      title: '프로그램은 무엇일까?',
      content:
        '프로그램은 컴퓨터에게 “이렇게 해”라고 알려주는 설명서입니다.\n컴퓨터는 스스로 생각하지 않고, 시킨 일만 합니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    },
    {
      id: 'tut1_p2',
      title: '프로그램의 공통 흐름',
      content:
        '모든 프로그램은 거의 비슷한 흐름을 가집니다.\n\n1️⃣ 정보를 받거나\n2️⃣ 생각해서 처리하고\n3️⃣ 결과를 보여줍니다',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    }
  ],

  conceptProblems: [
    {
      id: 'tut1_c1',
      question: 'Q. 프로그램에 대한 설명으로 가장 알맞은 것은?',
      options: [
        '컴퓨터가 혼자 생각하는 능력',
        '컴퓨터에게 할 일을 알려주는 설명서',
        '인터넷을 연결하는 장치',
        '게임을 실행하는 버튼'
      ],
      answer: '컴퓨터에게 할 일을 알려주는 설명서',
      hint: '컴퓨터는 시킨 일만 합니다.',
      explanation: '프로그램은 컴퓨터에게 무엇을 어떻게 할지 알려주는 지시서입니다.',
      type: 'concept'
    }
  ],

  codingProblems: []
};

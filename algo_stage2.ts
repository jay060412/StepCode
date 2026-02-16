import { Lesson } from './types';

export const algo_stage2: Lesson = {
  id: 'tut2',
  title: 'STAGE 2. 컴퓨터에게 말 걸기',
  description: '컴퓨터가 우리에게 결과를 보여주는 과정을 이해합니다.',
  category: 'tutorial',
  status: 'locked',
  pages: [
    {
      id: 'tut2_p1',
      title: '컴퓨터는 말을 할 수 있을까?',
      content:
        '컴퓨터는 스스로 말하지 못합니다.\n하지만 우리가 시키면, 화면에 결과를 보여줄 수 있습니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    },
    {
      id: 'tut2_p2',
      title: '화면에 결과가 나온다',
      content:
        '우리가 프로그램을 실행하면,\n컴퓨터는 결과를 화면에 보여줍니다.\n\n이 화면을 통해 우리는\n“컴퓨터가 제대로 일했는지” 확인합니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    }
  ],

  conceptProblems: [
    {
      id: 'tut2_c1',
      question: 'Q. 프로그램에서 화면에 결과를 보여주는 이유는 무엇일까요?',
      options: [
        '컴퓨터를 꾸미기 위해서',
        '사람이 결과를 확인하기 위해서',
        '속도를 빠르게 하기 위해서',
        '에러를 숨기기 위해서'
      ],
      answer: '사람이 결과를 확인하기 위해서',
      hint: '우리는 컴퓨터 속을 볼 수 없습니다.',
      explanation:
        '화면 출력은 사람이 컴퓨터의 작업 결과를 확인하는 유일한 방법입니다.',
      type: 'concept'
    }
  ],

  codingProblems: []
};

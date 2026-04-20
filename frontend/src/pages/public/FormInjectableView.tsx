import React, { useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';
import { PublicLayout } from '../../layouts/PublicLayout';

const surveyJson = {
  elements: [
    {
      name: "ideaPrincipal",
      title: "¿Cuál es la idea principal de tu proyecto?",
      type: "text",
      isRequired: true
    },
    {
      name: "email",
      title: "Tu email de contacto",
      type: "text",
      inputType: "email",
      isRequired: true
    }
  ],
  showQuestionNumbers: "off",
  completeText: "Enviar y cotizar",
  widthMode: "static",
  width: "100%"
};

export default function FormInjectableView() {
  const [submitted, setSubmitted] = useState(false);
  const survey = new Model(surveyJson);

  survey.onComplete.add((sender) => {
    console.log("Survey results:", sender.data);
    // Aquí se enviaría el Lead al backend real
    setSubmitted(true);
  });

  if (submitted) {
    return (
      <PublicLayout>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto text-xl">
             ✓
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">¡Mensaje enviado!</h2>
          <p className="text-sm text-slate-500">Pronto nos pondremos en contacto.</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center">Iniciá tu Proyecto</h2>
        <Survey model={survey} />
      </div>
    </PublicLayout>
  );
}

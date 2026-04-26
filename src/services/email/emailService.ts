import { apiClient } from '../config/apiClient';
import type { InscriptionEmailData, EmailPayload, CoursePaidResponse } from '../types';

export const sendConfirmationEmail = (inscriptionData: InscriptionEmailData): Promise<{ message: string }> => {
    const emailPayload: EmailPayload = {
        to: inscriptionData.email,
        subject: `Confirmación de tu Inscripción - ${inscriptionData.courseTitle}`,
        templateName: 'teamplate',
        data: {
            name: `${inscriptionData.nombre} ${inscriptionData.apellido}`,
            courseTitle: inscriptionData.courseTitle,
            price: inscriptionData.coursePrice,
            deeplink: inscriptionData.courseDeeplink,
            shortDescription: inscriptionData.courseShortDescription,
            year: inscriptionData.dateYear,
        },
    };
    return apiClient.post('/email/send-email', emailPayload);
};

export const sendPaymentSuccessEmail = (inscriptionData: InscriptionEmailData): Promise<{ message: string }> => {
    const turno = (inscriptionData as any).turnoId || (inscriptionData as any).turno;
    let details = '';
    if (turno && typeof turno === 'object') {
        details = `${turno.diaSemana || ''} de ${turno.horaInicio || ''} a ${turno.horaFin || ''} hs`;
    }

    const emailPayload: EmailPayload = {
        to: inscriptionData.email,
        subject: `¡Confirmación de tu lugar! ${inscriptionData.courseTitle}`,
        templateName: 'paymentSuccess',
        data: {
            name: `${inscriptionData.nombre} ${inscriptionData.apellido}`,
            courseTitle: inscriptionData.courseTitle,
            details: details,
            year: new Date().getFullYear(),
        },
    };
    return apiClient.post('/email/send-email', emailPayload);
};

export const sendDepositEmail = (inscriptionData: any): Promise<{ message: string }> => {
    const emailPayload: EmailPayload = {
        to: inscriptionData.email,
        subject: `Confirmación de pago: ${inscriptionData.courseTitle}`,
        templateName: 'depositConfirmation',
        data: {
            name: `${inscriptionData.nombre} ${inscriptionData.apellido}`,
            nombre: inscriptionData.nombre,
            apellido: inscriptionData.apellido,
            courseTitle: inscriptionData.courseTitle,
            horario: inscriptionData.horario || 'A coordinar',
            monto: String(inscriptionData.depositAmount || 0),
            fecha: new Date().toLocaleDateString('es-AR')
        },
    };
    return apiClient.post('/email/send-email', emailPayload);
};

export const sendCoursePaidEmail = async (inscriptionData: InscriptionEmailData): Promise<{ message: string }> => {
    const encodedCourseTitle = encodeURIComponent(inscriptionData.courseTitle);
    const courseData = await apiClient.get(`/courses/course-paid/${encodedCourseTitle}`) as CoursePaidResponse;

    if (!courseData?.success || !courseData?.data?.coursePaid) {
        throw new Error('El curso no tiene un link de acceso configurado.');
    }

    const turno = (inscriptionData as any).turnoId;
    let details = '';
    if (turno) {
        details = `${turno.diaSemana} de ${turno.horaInicio} a ${turno.horaFin} hs`;
    }

    const emailPayload: EmailPayload = {
        to: inscriptionData.email,
        subject: `¡Felicidades! Estás inscripto en "${courseData.data.courseTitle}"`,
        templateName: 'coursePaid',
        data: {
            name: `${inscriptionData.nombre} ${inscriptionData.apellido}`,
            courseTitle: courseData.data.courseTitle,
            coursePaid: courseData.data.coursePaid,
            details: details,
            year: new Date().getFullYear(),
        },
    };

    return apiClient.post('/email/send-email', emailPayload);
};

import {userCredentials} from './auth.models'
import {Form, Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { Link } from 'react-router-dom';

export default function AuthForm(props: authFormProps){
    return (
        <Formik
            initialValues={props.model}
            onSubmit={props.onSubmit}
            validationSchema={Yup.object({
                email: Yup.string().required('This field is required')
                    .email('You have to insert a valid email'),
                password: Yup.string().required('This field is required')
            })}
        >
            {formikProps => (
                <Form>
                    <TextField displayName="Почта" field="email" />
                    <TextField displayName="Пароль" field="password" type="password" />

                    <Button className="btn btn-success mx-2" disabled={formikProps.isSubmitting} type="submit">Ок</Button>
                    <Link className="btn btn-danger mx-2" to="/">Назад</Link>
                </Form>
            )}
        </Formik>
    )
}

interface authFormProps{
    model: userCredentials;
    onSubmit(values: userCredentials, actions: FormikHelpers<userCredentials>): void; 
}